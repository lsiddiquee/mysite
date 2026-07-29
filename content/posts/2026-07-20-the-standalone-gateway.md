---
title: "One phone link for every window — now behind a code"
date: 2026-07-20
summary: "Running several Copilot agents across windows and machines turns your phone into a wallet of QR codes. The CloakCode gateway multiplexes every window into one phone link — and the moment it's exposed beyond loopback, operator TOTP locks it down automatically."
tags:
  - cloakcode
  - gateway
  - security
---

_Part 2 of a series on CloakCode — observing and steering GitHub Copilot from your phone._
_([Part 1 — the why & setup](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting/).)_

## Update — what's different in 1.0

CloakCode 1.0 shipped on 2026-07-29 (Marketplace, npm, Docker Hub, GHCR). The gateway story below is
intact — one hub, many windows, operator TOTP as the front door — but four specifics have moved, one
of them a **correction**. I'm leaving the original post in place and correcting it up front rather
than quietly editing history.

### 1. Two listeners, not one

The single `ws://127.0.0.1:3543` endpoint has split by **role**, because the phone leg and the editor
leg have genuinely different security needs and were awkward to secure as one:

| Listener     | Who connects         | Default bind                           | Transport                           |
| ------------ | -------------------- | -------------------------------------- | ----------------------------------- |
| **operator** | the PWA / your phone | `127.0.0.1:3543`                       | HTTP/WS, fronted by your Dev Tunnel |
| **provider** | your VS Code windows | `127.0.0.1:3544` (`0.0.0.0` in Docker) | **`wss://` by default**             |

A provider that knocks on the operator port is refused, and vice versa. `npx @cloakcode/gateway`
prints both URLs. Ports are `CLOAKCODE_GATEWAY_PORT` and `CLOAKCODE_TLS_PORT`.

### 2. The editor-to-gateway hop is encrypted by default

The section [The honest caveat: TOTP gates, it does not encrypt](#the-honest-caveat-totp-gates-it-does-not-encrypt)
below describes the editor hop as plain `ws://` and `wss` as an interesting open problem. **That
problem is solved and shipped**, and that caveat is retired.

The provider listener serves **`wss://` out of the box**. On first run the gateway generates a
self-signed certificate and persists it under `~/.cloakcode` (private key mode `0600`, never logged);
bring your own with `CLOAKCODE_TLS_CERT_FILE` / `_KEY_FILE`. The extension trusts it by pinning the
certificate's **SHA-256 fingerprint**, and it **fails closed** — a mismatch is a hard error with no
fallback to the embedded bridge, and there is no trust-on-first-use anywhere in the path.

The pin reaches the extension **out-of-band**, as part of a single pairing URL:

```text
wss://host.docker.internal:3544#fp=82F20036F2E8…
```

One copy-paste carries both the address and the pin. It's a URL **fragment**, so the pin is never
transmitted to the server or any proxy — the extension splits it off locally. You get it from the
gateway's own console, or from the PWA's **Settings → Connect an extension** view, which sits behind
the tunnel sign-in _and_ your TOTP. Still want plaintext on a trusted segment?
`CLOAKCODE_PROVIDER_INSECURE=1` opts down, and says so loudly in the console and the UI.

So the setting in [Your editors sign in the same way](#your-editors-sign-in-the-same-way) is now:

```json
"cloakcode.gatewayUrl": "wss://<gateway-host>:3544#fp=<fingerprint>"
```

Paste the whole pairing URL. (A separate `cloakcode.gatewayCertFingerprint` still exists if you prefer
a bare URL; a value there that _contradicts_ the URL's pin is refused rather than silently resolved.)
Sign-in is unchanged — code once, token thereafter, per gateway URL.

### 3. Correction: the Docker image does not turn MFA on by itself

Below, the post says _"because the Docker image binds `0.0.0.0` by default, running the container
means MFA is on out of the box."_ **That is no longer true, and it's the one thing here you could get
wrong in practice.** After the listener split, the image binds the **operator** listener to
`127.0.0.1` — only the **provider** listener binds `0.0.0.0`. Since secure-by-exposure is evaluated
against the _operator_ bind, a bare `docker run` is _not_ "exposed" and MFA stays off.

What turns it on is what actually exposes your phone leg: setting `CLOAKCODE_TUNNEL=devtunnel`, or
overriding `CLOAKCODE_GATEWAY_HOST=0.0.0.0` yourself. Both are the normal path to reaching the hub
from a phone, so most real deployments still get MFA automatically — but "the container binds wide, so
you're covered" was the wrong reason. As always, `CLOAKCODE_MFA=required` forces it regardless, and is
worth setting if you want the guarantee rather than the inference.

### 4. The Docker example publishes the wrong port now

In [Keep your state across upgrades](#keep-your-state-across-upgrades-docker) below, `-p 3543:3543`
publishes the operator listener — which the image binds to loopback, so it reaches nothing. Publish
the **provider** port so your editors can connect, and let the tunnel handle the phone:

```bash
docker run -d --name cloakcode -p 3544:3544 \
  -e CLOAKCODE_MFA_SECRET_FILE=/home/app/.cloakcode/mfa/secret.json \
  -e CLOAKCODE_GATEWAY_LOG_FILE=/home/app/.cloakcode/logs/gateway.jsonl \
  -e CLOAKCODE_TUNNEL=devtunnel \
  -v cloakcode-persistent-state:/home/app/.cloakcode \
  -v cloakcode-devtunnel:/home/app/.local/share/DevTunnels \
  ghcr.io/lsiddiquee/cloakcode-gateway:latest
```

Two notes on that volume list. The `~/.cloakcode` mount now also carries the **TLS certificate**, so
your fingerprint survives an image bump and paired extensions don't need re-pinning — one more reason
not to run stateless. And the Dev Tunnel token lives at `$HOME/.local/share/DevTunnels`; mounting that
path directly is the supported way to keep the sign-in. (The original example folded it in via
`XDG_DATA_HOME` — plausible, since that _is_ the XDG default path, but I never verified the CLI honours
the override, so take the explicit mount.)

Everything else — pair-once enrolment, the code-then-token editor sign-in, the demoted static token,
the locked-gateway-won't-lose-you behaviour — works exactly as written below.

---

In [Part 1](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting/) you installed CloakCode, hit **Show Phone Link**, and
drove a single VS Code window from your pocket. One window, one link — perfect for one project. But
by mid-afternoon you rarely have one window.

## The four-QR-codes afternoon

Your microservices monorepo isn't the problem — that's a **single multi-root workspace**, a dozen
services in one window. The sprawl is everything around it: the client's SDK you opened in a second
window, the **dev container** where the integration suite runs Copilot against a throwaway database,
the beefy **remote box** you offloaded a six-hour refactor onto so your laptop could stay cool, and
the **Windows/WSL** split you never fully escaped. And here's the modern twist: because each agent
works while you don't ([Part 1](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting/)'s whole premise), you stopped running
them one at a time. You **fan out** — the refactor here, the migration there, a test-writing pass in
the container — several agents grinding **in parallel**. Three or four VS Code windows across two
machines — and in embedded mode, that's four bridges, four phone links, four QR codes. Your phone's
home screen starts to look like a loyalty-card wallet, and with that many agents running, **any number
of them could be blocked at once** — which is the only question you actually care about:

> Which of these is blocked right now?

Embedded mode is per-window by design; it was never meant to be the town square. That's the gateway's
job.

## One hub, one link

The gateway is a small process you run **outside** the editor. It does two things:

- **Serves the phone app** (the PWA) at a single URL.
- **Multiplexes:** your VS Code windows connect _out_ to it as **providers**; your phone connects
  _in_ as the **operator**; the hub merges every window's sessions into one list.

So four windows stop publishing four links and instead **connect in** to one. You open a **single**
link on your phone and see everything. The same session seen from two windows collapses to one row
(de-duplicated by its globally unique id), and each row is **tagged with the gateway it came from** —
the hub announces its instance name (an explicit `CLOAKCODE_INSTANCE_ID`, or the machine's hostname by
default), so `home` and `office` never blur together on the phone.

It ships as a normal package — no repo checkout:

```bash
npx @cloakcode/gateway          # serves ws://127.0.0.1:3543, prints the URLs to point editors at
```

- **npm:** [`@cloakcode/gateway`](https://www.npmjs.com/package/@cloakcode/gateway)
- **Docker:** [`likhan/cloakcode-gateway`](https://hub.docker.com/r/likhan/cloakcode-gateway)
  (or `ghcr.io/lsiddiquee/cloakcode-gateway`)

There are no CLI flags — it's configured entirely by environment variables you set inline.

## The moment it earns your trust: it asks for a code

Here's what changed since the early builds, and it's the part worth slowing down for.

The first time you **expose** that hub — bind it so your other machines can reach it, or turn on the
phone tunnel — CloakCode does **not** just start serving your session list to whoever finds the URL.
It comes up **locked**, and the first thing your phone sees is: _enter the 6-digit code from your
authenticator._

That's **operator TOTP** — the same time-based codes your authenticator app already shows for your
bank and your email — and it is now the **primary** way in. Not a shared password you set once and
forget. Not an afterthought behind a flag. The rule is **secure-by-exposure**:

> The moment the gateway is reachable beyond loopback — a wide bind **or** a live tunnel — operator
> TOTP turns on **by itself**.

That's a **zero-trust** stance in miniature: reaching the URL earns a client _nothing_. The network is
never the trust boundary — every phone proves itself with a code and every editor with a token, on
**every** connection, however it got there.

Because the **Docker image binds `0.0.0.0` by default**, running the container means MFA is on out of
the box. (Force it either way with `CLOAKCODE_MFA=required` / `CLOAKCODE_MFA=off`; unset means "on
when exposed, off for pure loopback dev.")

_(**Corrected in 1.0** — the image binds the operator listener to loopback, so a bare `docker run`
does **not** turn MFA on by itself. See [the correction
above](#3-correction-the-docker-image-does-not-turn-mfa-on-by-itself).)_

### Pair once

On first run the gateway mints a secret and reports that **enrolment is required**. Until you pair,
the hub serves **only** the pairing screen — no session list, no transcripts, nothing. There is no
window where MFA is "half on" and your sessions leak to an unauthenticated phone.

Open the gateway — easiest on a **desktop** so you can scan the on-screen **QR** with your phone's
authenticator app — then type one code back to confirm. Done. The secret is written `0600` and never
leaves the box.

Rather the pairing secret never touch the wire at all? `CLOAKCODE_MFA_ENROL=strict` prints the QR to
the **console only** (`docker logs`); the browser just submits the code. From then on, every phone
logs in with the current code and receives a signed **session token** (12 hours, or 30 days with
"remember this device") so you're not retyping all day. Replays and repeated wrong codes are rejected,
and a bad-code streak locks the connection out.

## Your editors sign in the same way

Now the part that _used_ to be a shared password.

When the gateway requires TOTP, your **editors authenticate the same way your phone does**. Point a
window at the hub:

```json
"cloakcode.gatewayUrl": "ws://<gateway-host>:3543"
```

_(**Changed in 1.0** — this is now the `wss://…:3544#fp=…` pairing URL. See [the update
above](#2-the-editor-to-gateway-hop-is-encrypted-by-default).)_

…and instead of silently hosting its own embedded bridge, the extension asks you to **sign in**. Run
**CloakCode: Sign in to Gateway**, enter a code from the **same** authenticator you enrolled, and the
extension exchanges it for a **token** it stores per gateway (in the OS keychain) and presents on
every reconnect. It **never holds the TOTP secret** — only a derived token. Switch `gatewayUrl`
between `home` and `office` and each keeps its own token; no re-pairing.

This is the reversal worth calling out plainly: **the shared token is no longer the front door.** It's
demoted to a **headless escape hatch** — for an automated provider with no human to type a code, you
can still set a static secret on both sides:

```bash
CLOAKCODE_GATEWAY_TOKEN=<shared-secret> npx @cloakcode/gateway   # gateway
```

```json
"cloakcode.gatewayToken": "<shared-secret>"                       // each editor
```

The gateway accepts **either** a TOTP-issued token **or** that static secret (an _or_, not an
override) and drops anything else with `provider.auth_reject`. But for a human at a keyboard, the
code-then-token flow is _the_ path — the static token is the exception you reach for only when there's
no human in the loop.

### A locked gateway won't lose you

One deliberate consequence: if the gateway is reachable but the editor **isn't signed in yet**, the
extension **stays in gateway mode** — it does _not_ quietly drop to embedded and publish a second,
competing phone link. It flags a warning on the status item and waits for you to sign in. An auth wall
is something you clear, not something that reroutes you behind your back. (If the gateway is simply
_unreachable_ at startup, that's different — then it does fall back to embedded, so you're never
stuck.)

## Reaching it from your phone

Two ways in, same as the embedded story but centralized on the hub:

- **A private Dev Tunnel** — `CLOAKCODE_TUNNEL=devtunnel`. The gateway hosts a **private,
  sign-in-required** tunnel and prints the phone URL; the Docker image even ships the `devtunnel` CLI
  and signs in via **device code** — headless, so no `-it`: the code prints to `docker logs` and you
  finish it in any browser (a GitHub login by default; `CLOAKCODE_TUNNEL_PROVIDER=microsoft` for a
  Microsoft account). Works from anywhere.
- **Your LAN** — bind `CLOAKCODE_GATEWAY_HOST=0.0.0.0` and open `http://<host-lan-ip>:3543` on a phone
  on the same Wi-Fi, no tunnel. Operator TOTP still gates the phone, but do this **only on a trusted
  network** — see the caveat next.

## The honest caveat: TOTP gates, it does not encrypt

Two boundaries, authenticated separately: the **phone** with TOTP, the **editors** with their derived
token (or the demoted static one). Both are **authentication**, not transport encryption. That's the
one seam in the zero-trust story: **identity** is checked on every hop, but **confidentiality** on the
local leg still leans on a trusted segment until `wss` lands. The
editor↔gateway hop is still plain `ws://`, so on a real network the token and the mirrored transcript
travel in cleartext — a non-issue on **loopback** (nothing hits the wire), fine on a **trusted LAN**,
and exactly why you keep a wide bind off networks you don't control. The **phone** leg is different: it
rides your private Dev Tunnel, which is TLS. Adding `wss` to the local hop **without shipping a private
key** is a genuinely interesting open design — the full discussion is in
[Part 4 — Security by construction](https://www.likhansiddiquee.com/blog/security-by-construction/#5-transport-encryption-how-a-self-signed-gateway-earns-trust).

_(**Superseded in 1.0** — the editor hop is now `wss` by default. See [the update
above](#2-the-editor-to-gateway-hop-is-encrypted-by-default).)_

## Keep your state across upgrades (Docker)

A container is ephemeral: recreate it and — without volumes — the **TOTP secret regenerates** (so
every paired phone must re-enrol), the tunnel sign-in drops, and the action log vanishes. Mount one
persistent state volume so all three survive an image bump:

```bash
docker run -d --name cloakcode-latest -p 3543:3543 \
  -e XDG_DATA_HOME=/home/app/.cloakcode/xdg \
  -e CLOAKCODE_MFA_SECRET_FILE=/home/app/.cloakcode/mfa/secret.json \
  -e CLOAKCODE_GATEWAY_LOG_FILE=/home/app/.cloakcode/logs/gateway.jsonl \
  -e CLOAKCODE_TUNNEL=devtunnel \
  -v cloakcode-persistent-state:/home/app/.cloakcode \
  ghcr.io/lsiddiquee/cloakcode-gateway:latest
```

_(**Changed in 1.0** — publish `3544`, not `3543`, and mount the tunnel token explicitly. See [the
updated example above](#4-the-docker-example-publishes-the-wrong-port-now).)_

That single volume keeps the MFA secret, gateway log, and Dev Tunnel sign-in state together across
upgrades (`XDG_DATA_HOME` folds the tunnel token into it too). Watch `docker logs cloakcode-latest` for
the pairing QR and the tunnel's **device-code** prompt — it's headless, so there's no `-it` and no
browser on the box: you finish the sign-in from your phone or laptop. The tunnel logs in with a
**GitHub** account by default; add `-e CLOAKCODE_TUNNEL_PROVIDER=microsoft` to use a Microsoft one. The
gateway README has the full [persistence table](https://www.npmjs.com/package/@cloakcode/gateway).

## When to bother

- **One project, one window?** Stay embedded. The gateway is moving parts you don't need.
- **Several windows / a dev container / two machines?** Run one gateway, point them all in, and open
  one **code-gated** link on your phone. That's the payoff.

Next up, **[Part 3 — Deploying the gateway](https://www.likhansiddiquee.com/blog/secured-deployment/):** getting through dev
containers, WSL, and your LAN — which listener to expose where, and why "forward the port, don't widen
the bind" now applies to one of the two and not the other.

---

**Links:**
[Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode) ·
[Gateway (npm)](https://www.npmjs.com/package/@cloakcode/gateway) ·
[Gateway (Docker)](https://hub.docker.com/r/likhan/cloakcode-gateway) ·
[Source (GitHub)](https://github.com/lsiddiquee/CloakCode)
