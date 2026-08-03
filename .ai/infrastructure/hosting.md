# Hosting & Access

Where things run, and how to reach them.

| What | Where | Access |
|---|---|---|
| **Web / API apps** (Fastify SaaS) | **NeoServ** (`neoserv.si`), shared hosting | `ssh blangeu@jtdigital.si -p 5050` |
| **Compute fleet** (render workers, broker) | **Hetzner** dedicated + cloud (Falkenstein) | `ssh -i ~/.ssh/id_rsa_jtdigital root@<ip>` |
| **Object storage** | **Hetzner S3** (`fsn1.your-objectstorage.com`) | S3 key (per project) |

## Web / API — NeoServ

The user-facing SaaS apps run as **Fastify** apps on NeoServ shared hosting. They talk to the [render fleet](renderbox.md) and [LLM service](llm.md) outbound over the broker (`mq.jtdigital.si:8443`) — NeoServ → broker RTT ~21.6 ms.

- **SSH:** `ssh blangeu@jtdigital.si -p 5050`.
- **DNS** (e.g. `mq.jtdigital.si`) is managed at NeoServ.
- **Deploy is interactive** — deploy scripts can't run headless/over Bash. After code changes, commit + push and let the user deploy (unless they ask otherwise).

## Compute — Hetzner

Render workers and the message broker are Hetzner boxes in **Falkenstein (FSN)** — keeping the whole fleet in one DC makes intra-fleet routes sub-millisecond. Specs + roles per box: [renderbox.md § Fleet](renderbox.md#fleet).

- **SSH key:** `~/.ssh/id_rsa_jtdigital` (used for all Hetzner dedicated/cloud boxes), `root@<ip>`.
- **No Hetzner Cloud Firewall** on the broker; sensitive ports (plain AMQP `:5672`, RabbitMQ mgmt `:15672`, Ollama `:11434`) are bound to **loopback** and reached via SSH tunnel, not exposed.

## SSH key reference

| Target | Key / command |
|---|---|
| Hetzner fleet (broker, GPU, encode) | `ssh -i ~/.ssh/id_rsa_jtdigital root@<ip>` |
| NeoServ (web/API) | `ssh blangeu@jtdigital.si -p 5050` |
| RabbitMQ mgmt UI | `ssh -L 15672:localhost:15672 root@167.233.22.243` |
| Ollama API (debug) | `ssh -L 11434:127.0.0.1:11434 root@88.198.62.120` |
