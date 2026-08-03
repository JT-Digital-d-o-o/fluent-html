# Self-hosted LLMs

Open-weight LLMs served from the [RenderBox GPU box](renderbox.md#gpu-worker--renderbox-gpu) (RTX 4000 Ada) for **internal / batch** use — cheap inference without a third-party API. Standalone: not part of the render job pipeline.

## How to call it

Ollama is **localhost-only** on the GPU box — never expose or call it directly. Reach it through the **broker** (`renderbox-llm-worker`, an AMQP bridge):

1. Publish a job to broker queue **`llm.pending`** (durable) with RPC fields `reply_to` + `correlation_id`.
2. The worker consumes it, calls local Ollama, replies on your `reply_to` (fallback results `llm.results`).
3. **VLM images:** claim-check via S3 — upload to `renderboxfsn` under `llm-inputs/`, pass `image_keys` in the job; the worker fetches by key.

- **Broker:** `mq.jtdigital.si:8443` (AMQPS), user `llm` (scoped to `llm.*` / `amq.gen.*` / `amq.default`).
- **Concurrency:** `prefetch=1` — one job / one model at a time; coexists with video render jobs.
- Job/result schema + example producer: [`renderbox-llm-worker/README.md`](../../renderbox-llm-worker/README.md).

> Direct (debugging only): tunnel `ssh -L 11434:127.0.0.1:11434 root@88.198.62.120`, then the OpenAI-compatible API at `http://127.0.0.1:11434`.

## Deployed models

`ollama list` — ~22–48 tok/s on the RTX 4000 Ada. One model resident at a time (`OLLAMA_MAX_LOADED_MODELS=1`, `OLLAMA_KEEP_ALIVE=5m`); a swap reloads ~6–15 s from NVMe.

| Model | Use case | Disk | ~VRAM |
|---|---|---|---|
| `qwen3:14b` | chat + structured extraction (`format: json`) | 9.3 GB | ~10 GB |
| `qwen3-vl:8b` | **VLM** — image / video-frame OCR + scene analysis | 6.1 GB | ~7.9 GB |
| `qwen2.5-coder:14b` | code generation | 9.0 GB | ~12 GB |
| `phi4-reasoning:latest` | reasoning (MIT) | 11 GB | ~12 GB |

> **Also on the box — on-demand, separate stack:** **GLM-4.6V-Flash** (9B VLM, MIT) served by **vLLM**, not Ollama. Too new for Ollama/llama.cpp. Holds ~17 GiB, so it **can't be hot alongside Ollama** — ships **stopped**. See [On-demand: GLM-4.6V-Flash](#on-demand-glm-46v-flash-vllm-fp8) below.

## Calling gotchas

- **Hybrid-reasoning models** (`qwen3`, `qwen3-vl`, `phi4-reasoning`): `"think": false` does **not** suppress the `<think>` block in this Ollama build. Set `options.num_predict ≥ 512` or `content` comes back empty (reasoning eats the token budget).
- **`qwen3-vl`** routes reasoning to a separate `thinking` field — `content` stays clean.
- **`phi4-reasoning`** emits the reasoning into `content` — strip it before the final answer.

## On-demand: GLM-4.6V-Flash (vLLM, FP8)

A 9B vision-language model (Z.ai, **MIT**) served by **vLLM** in an isolated venv — a *separate stack* from Ollama. Deployed **2026-06-29** as an **on-demand** service: it's installed **stopped + disabled** because it holds ~17 GiB and **cannot run at the same time as Ollama** on the 20 GB card. Ollama stays the default; bring GLM up only when you need it. **Not wired into the broker/`llm-worker` yet** — call it directly (below).

- **Why vLLM, not Ollama:** GLM-4.6V is too new for Ollama/llama.cpp (no vision support); needs **vLLM ≥0.12 + transformers ≥5.0**. Installed at `/opt/glm-vllm` (venv: vLLM 0.23, transformers 5.12, torch 2.11, CUDA-13 wheels).
- **Weights:** `zai-org/GLM-4.6V-Flash` (BF16, ~20 GB) cached under `/root/.cache/huggingface`. Served at **FP8** (`--quantization fp8`; Ada has FP8 tensor cores) → **~17.2 GiB resident**, fits with headroom.
- **Verified 2026-06-29:** correctly read a synthetic test image (blue circle + the text `RENDERBOX 42`); ~4.7 s / 88 tok; power 8 W → **68 W @ 78%** during inference (~70 W cap, as expected).

### Bring it up / down (`glm-vllm.service`)
```bash
ssh -i ~/.ssh/id_rsa_jtdigital root@88.198.62.120
systemctl start glm-vllm     # ExecStartPre evicts the Ollama VLM first; ~80 s to /health
systemctl stop  glm-vllm     # hand the 17 GiB back to Ollama
# Deliberately NOT `enable`d on boot — it would grab 17 GiB and starve the Ollama llm-worker.
```

### Call it (OpenAI-compatible, localhost-only on `:8000`)
Tunnel for debugging: `ssh -L 8000:127.0.0.1:8000 root@88.198.62.120`, then `POST http://127.0.0.1:8000/v1/chat/completions` with `"model": "glm-4.6v-flash"` and an `image_url` content part — either an `http(s)://…` URL **or** a `data:image/png;base64,…` URI (base64 is more reliable; some hosts block hotlinking).

### vLLM gotchas (hard-won 2026-06-29)
- **FlashInfer JIT is broken on this box** — its bundled CCCL headers clash with the CUDA-13 toolkit (`"CUDA compiler and CUDA toolkit headers are incompatible"`). The unit forces `VLLM_ATTENTION_BACKEND=FLASH_ATTN` + `VLLM_USE_FLASHINFER_SAMPLER=0` (prebuilt FlashAttention + Torch-native sampler, **zero compilation**). Don't remove these.
- **`--enforce-eager`** skips CUDA-graph capture for a faster, simpler start; drop it if you later want graph perf.
- **Thinking + box tokens land *inside* `content`:** replies come back as `<think>…</think>` then the answer between `<|begin_of_box|>…<|end_of_box|>` (it may emit the box twice). Unlike Ollama's `qwen3-vl` (separate `thinking` field), here you must strip `<think>` and extract the box span yourself. Budget `max_tokens ≥ 256`.

## Throughput & batching (measured 2026-07-05)

Concurrency sweep on the RTX 4000 Ada — aggregate output tok/s vs simultaneous 256-token requests (`llm_bench.py`). The two stacks scale **oppositely**:

| simultaneous reqs | **Ollama** qwen3-vl:8b (Q4) | **vLLM** glm-4.6v-flash (FP8) |
|---|---|---|
| 1 | **47** tok/s | 24 tok/s |
| 8 | 48 | 142 |
| 32 | 48 | 672 |
| 64 | 48 | 1183 |
| 128 | — | **1831** |
| 256 | — | 2268 (latency 2×) |

- **Ollama doesn't batch out-of-box** (`OLLAMA_NUM_PARALLEL` unset → serial queue): aggregate throughput is **flat ~48 tok/s at any concurrency**, latency just grows linearly (5 s → 46 s across conc 1→16). At a single request it *beats* vLLM (47 vs 24) — it runs a lighter Q4 model. **→ Ollama for single-user / interactive.**
- **vLLM continuous-batches:** throughput scales ~linearly to a **knee at ~128 concurrent (~1830 tok/s, ≈40× Ollama)**, latency flat until then; conc 256 adds only +24 % for 2× latency. It keeps scaling *through* the 70 W cap because LLM decode is **memory-bandwidth-bound**, not compute-bound. **→ vLLM for multi-user / batch throughput.**
- Not apples-to-apples on absolute tok/s (different model + quant: 8B-Q4 vs 9B-FP8) — the **scaling shape** is the point, and it's engine-determined. Raising `OLLAMA_NUM_PARALLEL` lets Ollama batch *somewhat*, but not to vLLM's continuous-batching ceiling.

> Roadmap: vLLM is now on the box (used on-demand for GLM-4.6V-Flash above). Still TODO — **broker/`llm-worker` integration** for vLLM, high-throughput **batch** (continuous batching, FP8/AWQ, Sleep Mode), a REST/OpenAI gateway if interactive callers appear, and `qwen2.5-coder:32b` (~20 GB) for max code quality when the GPU is idle. Permanent GLM-4.6V (enable-on-boot) needs a VRAM policy: it displaces Ollama.
