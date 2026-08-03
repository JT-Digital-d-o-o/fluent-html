# Infrastructure & Shared Services

Shared JT Digital infra + services any project can consume. Read when a project needs rendering, LLM inference, the message broker, object storage, hosting, or web-performance tuning.

| Doc | Covers |
|---|---|
| [renderbox.md](renderbox.md) | RenderBox render engine — the **app integration wire contract** (AV-only: `pipeline_id`/`graph_ir` + claim-check `input_files` + `output`, fire-and-forget, poll-the-row SSR flow), video/image pipelines (FFmpeg + ONNX), the worker fleet |
| [llm.md](llm.md) | Self-hosted LLMs (Ollama on GPU) — deployed models + how to call them via the broker |
| [hosting.md](hosting.md) | Where apps run — NeoServ (web/API), Hetzner (the compute fleet), SSH/access conventions |
| [performance.md](performance.md) | Web performance & delivery — Core Web Vitals, resource hints, font loading, TLS/HTTP, caching, response streaming |

## Shared endpoints (quick reference)

| Service | Endpoint | Notes |
|---|---|---|
| Message broker | `mq.jtdigital.si:8443` (AMQPS, TLS 1.2/1.3) | RabbitMQ 4.0.5 @ `167.233.22.243` (FSN). Per-app users scoped to their own queues. Plain `:5672` / mgmt `:15672` are loopback-only. |
| Object storage (S3) | `fsn1.your-objectstorage.com` · bucket `renderboxfsn` | Hetzner S3 (Falkenstein). Video assets + render output. |
| LLM inference | broker queue `llm.pending` (RPC) | Ollama is localhost-only; reach it via the AMQP bridge, **never** call the GPU box directly. See [llm.md](llm.md). |
| Web/API host | `ssh blangeu@jtdigital.si -p 5050` | NeoServ shared hosting (the SaaS apps). See [hosting.md](hosting.md). |

- **SSH** to Hetzner dedicated/cloud boxes: key `~/.ssh/id_rsa_jtdigital` (`root@<ip>`).
- **Broker mgmt UI** (RabbitMQ): SSH tunnel `ssh -L 15672:localhost:15672 root@167.233.22.243`.

> Live operational state (fleet-change log, provisioning, costs, orders) is maintained in [`renderbox-sdk/infrastructure.md`](../../renderbox-sdk/infrastructure.md). The docs here are the current-state, cross-project reference.
