---
title: 'Deploying the gateway: containers, WSL, and your LAN'
date: 2026-07-29
summary: 'Where to run the CloakCode gateway when your editors are spread across a host, dev containers, and WSL — and how to reach it without carelessly binding 0.0.0.0.'
tags:
  - cloakcode
  - gateway
  - security
  - docker
---

_Part 3 of a series on CloakCode — observing and steering GitHub Copilot from your phone._
_([Part 1 — the why](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting/) ·
[Part 2 — the gateway](https://www.likhansiddiquee.com/blog/the-standalone-gateway/).)_

[Part 2](https://www.likhansiddiquee.com/blog/the-standalone-gateway/) introduced the gateway as one
hub for many windows. This is the practical follow-up: **where do you run it, and how do your editors
and your phone reach it** when they're scattered across a host, dev containers, and WSL — without
carelessly exposing it to your whole network?

## First, the thing that makes this tractable: there are two doors

The gateway doesn't have one endpoint. It has **two role-scoped listeners**, and almost every
deployment question gets easier once you stop treating them as one thing:

| Listener     | Who connects         | Default bind                                                 | Transport                                        |
| ------------ | -------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| **operator** | the PWA / your phone | `CLOAKCODE_GATEWAY_HOST`, `127.0.0.1:3543`                   | plain HTTP/WS — **your tunnel supplies the TLS** |
| **provider** | your VS Code windows | `CLOAKCODE_TLS_HOST`, `127.0.0.1:3544` (`0.0.0.0` in Docker) | **`wss://` by default, certificate-pinned**      |

A provider that knocks on the operator port is refused, and an operator on the provider port likewise.
They're separate doors with separate locks, and — this is the part that changes deployment advice —
**only one of them carries its own encryption.**

That gives two different rules instead of one blanket one:

> **The operator listener: forward the port, don't widen the bind.**
> **The provider listener: bind it where your editors are — it's encrypted and pinned.**

Both are the same **zero-trust** habit, just honestly applied. Don't lean on "it's only my LAN":
authenticate every hop, encrypt the ones you can, and expose the smallest surface that works. The
difference is that the provider hop _can_ now defend itself on a hostile segment, and the operator hop
still can't — so it stays behind something that can.

## The one constraint everything trades against

Loopback only reaches the **same network namespace**, and that's the whole challenge: a **dev
container**, a **WSL distro**, and the **Windows host** each have their _own_ `127.0.0.1`. They don't
see each other's. So "just use localhost" works _within_ one environment and silently fails _across_
them. Everything below is about crossing that line deliberately rather than by flinging open
`0.0.0.0`.

## The default: one environment, nothing exposed

If your editor(s) and the gateway live in the **same** place — same host, or same dev container/WSL
distro — you're done with no configuration:

```bash
npx @cloakcode/gateway
# operator (phone/PWA)  http://127.0.0.1:3543
# provider (extensions) wss://127.0.0.1:3544#fp=<fingerprint>
```

Every editor in that environment reaches the provider listener on loopback, and the phone comes via
the gateway's private tunnel (`CLOAKCODE_TUNNEL=devtunnel`). Nothing on the LAN. (For a single
environment you often don't even need the gateway — embedded mode from
[Part 1](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting/) already covers it. The
gateway earns its keep once you have _more than one_ environment.)

## The multi-environment model: one host gateway, editors connect in

The unifying setup when your editors are spread across the **host plus containers/WSL**: run **one**
gateway on the host and have every editor connect **out** to its provider listener.

```bash
# on the host — provider listener reachable from containers, operator stays on loopback
CLOAKCODE_TLS_HOST=0.0.0.0 npx @cloakcode/gateway
```

The gateway prints a pairing URL. Paste it whole into each editor — including the ones inside
containers and WSL:

```json
"cloakcode.gatewayUrl": "wss://host.docker.internal:3544#fp=82F20036F2E8…"
```

Then run **CloakCode: Sign in to Gateway** in each window and enter one TOTP code; the extension
exchanges it for a per-gateway token and stores it in the OS keychain.

`host.docker.internal` resolves to the host from inside a container — Docker Desktop provides it; with
**native** Docker, add `"runArgs": ["--add-host=host.docker.internal:host-gateway"]` to your
`devcontainer.json`. (WSL reaches the Windows host the same way, or see mirrored networking below.)

Note what this bind is and isn't. It's a `0.0.0.0` bind, so anything that can route to the host can
_open a socket_ — but what it finds is a TLS endpoint whose certificate it must match, in front of a
gateway that demands a valid code or token. A sniffer on that segment sees ciphertext; a spoofed
gateway on that address fails the pin on the extension side before a single frame is sent. That's a
meaningfully different proposition from the plaintext bind earlier drafts of this post warned you
about, and it's why widening _this_ listener is a normal deployment choice rather than a compromise.
Firewalling it to the Docker/WSL subnets is still good hygiene — defence in depth, not the only
defence.

The **operator** listener, meanwhile, hasn't moved. It's still on `127.0.0.1`, and your phone still
comes in over the tunnel.

## Two ways to avoid a wide bind entirely

**WSL ↔ Windows → mirrored networking.** If your split is specifically WSL2 ↔ Windows (Win 11 22H2+),
you don't need a wide bind at all. In `%UserProfile%\.wslconfig`:

```ini
[wsl2]
networkingMode=mirrored
```

Now WSL and Windows **share loopback** — a gateway on either side is reachable at `localhost:3544`
from the other, with both listeners left at their defaults. Clean.

**Gateway inside a remote, reached from your desktop → `forwardPorts`.** If you run the gateway
_inside_ a dev container/WSL and want to open its PWA in your **desktop** browser, add
`"forwardPorts": [3543]` to `devcontainer.json` (or accept VS Code's auto-forward prompt). VS Code
connects to the remote's own loopback and surfaces it at your **client's `localhost:3543`** — no wide
bind anywhere. This is the operator-listener rule in its purest form: forward the port, don't widen
the bind. (It's a desktop convenience; your **phone** still comes via the tunnel, since forwarding
lands on the client machine, not the phone.)

## A separate machine on your LAN

Sometimes the gateway really is on another box. The provider listener is built for this:

```bash
CLOAKCODE_TLS_HOST=0.0.0.0 npx @cloakcode/gateway
```

Your editors elsewhere on the LAN connect over `wss` with the pin from the pairing URL. The
certificate is generated once and persisted under `~/.cloakcode`, so the fingerprint survives restarts
and you pair each editor once.

Two things worth being deliberate about. **Get the pairing URL out-of-band** — read it off the
gateway's console, or from the PWA's authenticated **Settings → Connect an extension** view. Never
from something that answered the connection you're trying to secure; that's trust-on-first-use wearing
a pin's clothing, and the extension deliberately won't do it for you. And **leave the operator
listener alone**: `CLOAKCODE_GATEWAY_HOST=0.0.0.0` puts your session list and transcripts on the wire
in cleartext, gated by TOTP but not concealed by it. If you truly need the PWA over the LAN, treat it
as trusted-network-only — the gateway prints a warning when you do it, and it means it.

## Cheat sheet

| Editor/phone → gateway is…                   | Default `127.0.0.1` works? | Do this                                                                             |
| -------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| same host / same WSL distro / same container | yes                        | nothing — paste the printed `wss://localhost:3544#fp=…`                             |
| a container/WSL editor → gateway on the host | no                         | `CLOAKCODE_TLS_HOST=0.0.0.0`; `gatewayUrl: wss://host.docker.internal:3544#fp=…`    |
| WSL ↔ Windows                                | not directly               | **WSL mirrored networking** → `localhost` works, no wide bind                       |
| desktop browser → gateway inside a remote    | no (remote loopback)       | **`forwardPorts: [3543]`** → client `localhost:3543`                                |
| a separate LAN machine                       | no                         | `CLOAKCODE_TLS_HOST=0.0.0.0` — encrypted + pinned; firewall as depth                |
| **the phone (any topology)**                 | —                          | the gateway's **private tunnel** (`CLOAKCODE_TUNNEL=devtunnel`) — never the raw LAN |

### What about the operator hop — can't that be wss too?

It effectively is, wherever it matters: the phone leg rides your **private Dev Tunnel**, whose ingress
terminates real TLS and forwards over loopback, and the PWA derives `wss:` from the page origin. The
listener itself stays plaintext on loopback because something in front of it is already doing the job.

If you want to put your _own_ thing in front instead, both listeners are happy on loopback behind:

- **An overlay or SSH forward** — Tailscale, WireGuard, or `ssh -L`. Lowest friction if you already
  run one, and it authenticates as well as encrypts.
- **A reverse proxy** — Caddy/nginx/Traefik terminating TLS on a hostname you own. Best when you
  already have certificates and a name.

These used to be the _only_ way to get confidentiality on the editor hop. They're now an alternative
to native TLS, not a prerequisite — worth choosing when you already have the infrastructure, skippable
when you don't.

## The rule of thumb

- **One environment?** Embedded, or a gateway on that same host. `localhost`. Done.
- **Host + containers/WSL?** One host gateway, `CLOAKCODE_TLS_HOST=0.0.0.0`, editors connect in via
  `host.docker.internal` with the pairing URL.
- **WSL ↔ Windows only?** Mirrored networking; skip the wide bind.
- **Phone, always?** The private tunnel. It's the leg that leaves your machine, and the tunnel is what
  makes it confidential.
- **Widening the operator listener?** Only on a network you control, and know that you've traded
  confidentiality for convenience.

And a design note worth internalizing: the embedded bridge has **no `0.0.0.0` option on purpose** —
it's meant to stay on loopback. The moment you need cross-namespace reach, that's your cue to run the
**standalone gateway** (this post), not to try to widen the extension's bridge.

Next: **[Part 4 — Security by construction](https://www.likhansiddiquee.com/blog/security-by-construction/)** — the full threat
model, and the surprisingly deep engineering behind that one-line pairing URL.

---

**Links:**
[Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode) ·
[Gateway (npm)](https://www.npmjs.com/package/@cloakcode/gateway) ·
[Gateway (Docker)](https://hub.docker.com/r/likhan/cloakcode-gateway) ·
[Source (GitHub)](https://github.com/lsiddiquee/CloakCode)
