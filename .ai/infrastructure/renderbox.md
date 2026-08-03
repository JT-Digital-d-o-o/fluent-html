# RenderBox

Distributed render engine for video/image generation — FFmpeg encode/filter pipelines + ONNX inference (detect / segment / depth / pose / VQE) + text/caption animation. Projects (storysell, jt-cut, …) submit jobs and consume results; they never touch the workers directly.

## How a project consumes it

Producer (the SaaS app) → message broker → orchestrator compiles + dispatches → GPU/encode workers → object storage; results stream back on the app's own result queues.

- **Submit** via the renderbox SDK (build the job DSL, publish to the broker). SDK/job API: [`renderbox-sdk`](../../renderbox-sdk).
- **Broker**: `mq.jtdigital.si:8443` (AMQPS). Use your app's scoped broker user (e.g. `storysell`, `jt-cut`) — each is limited to its own queues.
- **Assets/output**: S3 `renderboxfsn` (`fsn1.your-objectstorage.com`). Large inputs ride a claim-check (upload to S3, pass the key in the job) so the broker stays light.
- **Results**: consume `results.<app>.{progress,completed,failed}`.

## App integration — the wire contract (Claude: read this first)

The engine is **AV-only** (video/audio/image), **never plain text**. The on-the-wire shape is JSON (protobuf is internal). One `job.submit` message:

```ts
{
  job_id: "demo-<uuid>",          // app-generated, FLAT: no `/ \ ..` / null bytes, ≤128 chars
  tenant_id: "jt-cut",            // your app's scoped broker user (also scopes result queues)
  user_id?: "...",
  // exactly ONE graph discriminator:
  pipeline_id: "face-redact",     // named server pipeline (common case) + `args`
  args: { model: "yolov8n-face", ... },
  //   OR graph_ir + bindings   (OpNode JSON)   OR rbx_source   (.rbx DSL)
  input_files: [{ s3_key, filename, content_type }],   // CLAIM-CHECK: upload to S3, pass the KEY, not a URL
  output: { bucket: "renderboxfsn", key: "<you-choose>", format: "mp4" },
}
```

- **Claim-check inputs**: upload the AV bytes to S3 **`renderboxfsn`** (the bucket the workers read), then reference the key. This bucket is **deliberately separate** from the app's own per-project bucket (avatars/files) — in the template it's `fastify.renderboxStorage` (`RENDERBOX_S3_*`), *not* `fastify.storage`. Upload inputs there.
- **Fire-and-forget**: correlate by `job_id` only — no `replyTo`/`correlationId`. The UI **never touches AMQP**; it polls a DB row the result consumer settles.
- **Results** on `results.<tenant>.{progress,completed,failed}`: completion carries `outputs: [{ kind, s3_key, bytes, ... }]` — the output S3 key. `partial_success` → treat as **failed** (there's no PARTIAL state). Progress is **noisy + non-monotonic** — throttle (skip when new % ≤ last).
- **SSR submit flow** (template pattern): create row → stamp `renderboxJobId` **before** publish (TOCTOU: a fast result must find the row) → publish + await broker confirm → flip to `RENDERING` guarded on `status:DRAFT` (lost-update race) → re-fetch (may already be terminal). A self-terminating poll route returns **204** while pending, swaps the terminal fragment (`outerHTML`) once settled. Add a stale-job sweeper (RENDERING older than N min → FAILED).
- **Pipelines** (named, current): `slideshow`, `gif-export`, `face-redact`, `snip`, `letterbox`. ⚠️ The engine is migrating **recipes → graph (OpNode JSON)** — `pipeline_id` may give way to `graph_ir`; verify against `renderbox-engine` before relying on a name.
- **Graceful absence**: no `AMQP_URL` → renderbox client inert; no `RENDERBOX_S3_*` → storage inert. Real AV jobs need **both**.
- **Reference impls**: template `projects-template/templates/full-stack/src/{app/renderbox-demo,infra/renderbox}/`; production [`jt-cut/src/gif-export/`](../../jt-cut/src/gif-export/gif-export.controller.ts) + [`jt-cut/src/projects/render/`](../../jt-cut/src/projects/render/render.controller.ts). Contracts: [`renderbox.contracts.ts`](../../projects-template/templates/full-stack/src/infra/renderbox/renderbox.contracts.ts).

## Topology

```
        NeoServ (API) ──AMQP──┐                  jtdigital.si:5050 (Fastify SaaS)
                              ▼
   renderbox-rabbitmq (CPX22, FSN) · 167.233.22.243 · RabbitMQ 4.0.5
   + renderbox-orchestrator (:9091)   ── compile + dispatch
        │                                   │
   jobs.pending.gpu                    jobs.pending.encode
        ▼                                   ▼
   renderbox-gpu (GEX44)              renderbox-encode-fsn (Auction)
   88.198.62.120 · RTX 4000 Ada      148.251.136.145 · i9-13900 (CPU)
        └──────────────┬────────────────────┘
                       ▼
          Object Storage (S3) · fsn1.your-objectstorage.com · bucket renderboxfsn
```

Whole fleet is in **Hetzner Falkenstein (FSN)** — intra-fleet routes are sub-millisecond.

## Fleet

### Broker + orchestrator — `renderbox-rabbitmq`
| | |
|---|---|
| **Role** | RabbitMQ 4.0.5 broker + co-located `renderbox-orchestrator` (compile + dispatch) |
| **IP** | `167.233.22.243` · CPX22 (2 vCPU / 4 GB / 80 GB), Ubuntu 26.04, FSN |
| **AMQP** | AMQPS `mq.jtdigital.si:8443` (TLS 1.2/1.3). Plain `:5672` + mgmt `:15672` loopback-only. |
| **Orchestrator** | `renderbox-orchestrator.service`, health `http://localhost:9091/health/ready` |
| **SSH** | `ssh -i ~/.ssh/id_rsa_jtdigital root@167.233.22.243` |

**Users:** `renderbox` (admin), `storysell`, `jt-cut`, `llm` — each scoped to its own queues.
**Queues:** `jobs.{submit,pending.gpu,pending.encode,progress,completed,failed}`, `results.{storysell,jt-cut}.{progress,completed,failed}`, `storysell.scrape.{pending,completed,failed}`, `llm.pending`, `orchestrator.heartbeat`. Exchanges `renderbox`/`scrape`/`storysell` (topic).

### GPU worker — `renderbox-gpu`
| | |
|---|---|
| **Role** | GPU render worker — CUDA ONNX (detect/segment/depth/pose/VQE) + FFmpeg. Also hosts the [LLM service](llm.md) and an [experimental colorization stack](#experimental-video-colorization-colormnet). |
| **IP** | `88.198.62.120` · GEX44, FSN |
| **GPU** | NVIDIA RTX 4000 SFF Ada (20 GB, SM 8.9) — driver 610.43.02 + CUDA 12.9 + cuDNN 9.23 |
| **CPU/RAM** | i5-13500 (14C/20T) · 64 GB · 2× 1.92 TB NVMe (RAID0) · Ubuntu 24.04 |
| **Worker** | `renderbox-worker.service`, features `onnx-cuda,opencv,mqtt,lineage`, consumes `jobs.pending.gpu` |

Ada (SM 8.9) is fully supported by CUDA 12.x + cuDNN 9, so all ONNX models run on GPU (`ort` 2.0.0-rc.12, no downgrade).

#### GPU throughput profile — the 70 W cap (measured 2026-07-05)

Slot-powered SFF → **hard 70 W cap** (lowerable, never raisable; no external power connector). Vision and LLM hit it **oppositely**, which drives worker tuning:

- **Vision (ONNX/CNN) is compute-bound → the cap is a ceiling.** ResNet-50 fp16 batch sweep peaks at **batch 8 (~1770 img/s)** then *declines* — batches ≤8 stay ~40 W / 1620 MHz, batches ≥32 peg 64–69 W and the SM clock throttles to ~1455 MHz. **Batch ≈8 for GPU vision inference; larger batches are counterproductive on this card.** Expect ~40–50 % of spec-sheet compute on sustained ONNX (SW power-cap throttle constantly active, ~68 °C — not thermal). Keep `WORKER_CONCURRENCY=1` for compute-heavy jobs: two concurrent CUDA jobs just split the 70 W.
- **LLM decode is memory-bandwidth-bound → the cap barely bites**, so it keeps scaling to ~128 concurrent — the opposite tuning. See [llm.md](llm.md) → *Throughput & batching*.

#### Experimental: video colorization (ColorMNet)

Sandbox **B&W → color** video stack on the GPU box — **research / non-commercial only** (ColorMNet weights are CC BY-NC-SA). Standalone: runs *outside* `renderbox-worker` in an isolated micromamba env, not part of the render job pipeline.

- **Chain:** DDColor (in-graph ONNX `colorize`, Apache-2.0) colorizes frame 0 → **ColorMNet** (ECCV 2024) propagates temporally-consistent color across the clip. ColorMNet is deliberately *not* an ONNX in-graph op — its 5D `grid_sample` + DINOv2 + memory loop are ORT-incompatible — so it's the standalone "temporal colorization" lane (per-frame DDColor flickers; ColorMNet adds cross-frame stability).
- **Location:** `/root/renderbox/colormnet-demo` · env `micromamba run -n colormnet` (torch 2.0.1+cu118; DDColor seed reuses `/opt/renderbox/models/ddcolor.onnx`). Run: `bash /root/renderbox/kekec_demo.sh` (DDColor→ColorMNet chain) or `colormnet_demo.sh` (exemplar already colored).
- **Throughput:** ~12 fps @ ~480p on the RTX 4000 Ada (70 W cap) — e.g. a 373-frame clip in ~65 s.
- **Demos:** S3 `renderboxfsn/demos/colorize/`.

### Encode worker — `renderbox-encode-fsn`
| | |
|---|---|
| **Role** | CPU FFmpeg encode/filter + CPU ONNX |
| **IP** | `148.251.136.145` · Hetzner Auction, FSN |
| **CPU/RAM** | i9-13900 (24C/32T, 5.6 GHz) · 128 GB DDR5 ECC · 2× 1.92 TB NVMe · Ubuntu 24.04 |
| **Worker** | `renderbox-worker.service`, features `opencv,mqtt,lineage`, `WORKER_CONCURRENCY=2`, consumes `jobs.pending.encode` |

Native (not Docker) FFmpeg 6.1.1 with `libass`/`libfontconfig`/`libfreetype`; fonts staged under `/usr/local/share/fonts/renderbox` (Anton, Bebas Neue, Montserrat, Inter, DejaVu) for caption burn-in.

### Object storage — `renderboxfsn`
S3-compatible, `fsn1.your-objectstorage.com`, bucket `renderboxfsn`, region `fsn1` (Hetzner FSN). Video assets + render output (one S3 key works across the project's buckets).

## Deploy

[`renderbox-worker/deploy.sh`](../../renderbox-worker/deploy.sh) syncs all crates (ir, lang, compiler, runtime, sdk, worker) to each server, builds with per-worker feature flags, installs the binary, restarts the systemd service.

```bash
renderbox-worker/deploy.sh          # all workers
renderbox-worker/deploy.sh gpu      # GPU only
renderbox-worker/deploy.sh encode   # encode farm only
```

## Common ops

```bash
ssh -i ~/.ssh/id_rsa_jtdigital root@148.251.136.145                              # SSH the encode worker
ssh -i ~/.ssh/id_rsa_jtdigital root@148.251.136.145 systemctl status renderbox-worker
ssh -L 15672:localhost:15672 root@167.233.22.243                                 # broker mgmt UI tunnel
```

## Inter-node latency (FSN, 2026-06-26)

| Route | RTT |
|---|---|
| worker → S3 | ~0.2–0.5 ms (TCP:443) |
| GPU ↔ encode | 0.87 ms |
| worker → broker | 0.76–1.0 ms |
| NeoServ (API) → broker | 21.6 ms |
