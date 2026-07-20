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
_([Part 1 — the why & setup](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting).)_

In [Part 1](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting) you installed CloakCode, hit **Show Phone Link**, and
drove a single VS Code window from your pocket. One window, one link — perfect for one project. But
by mid-afternoon you rarely have one window.

## The four-QR-codes afternoon

Your microservices monorepo isn't the problem — that's a **single multi-root workspace**, a dozen
services in one window. The sprawl is everything around it: the client's SDK you opened in a second
window, the **dev container** where the integration suite runs Copilot against a throwaway database,
the beefy **remote box** you offloaded a six-hour refactor onto so your laptop could stay cool, and
the **Windows/WSL** split you never fully escaped. And here's the modern twist: because each agent
works while you don't ([Part 1](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting)'s whole premise), you stopped running
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
  and signs in via device code. Works from anywhere.
- **Your LAN** — bind `CLOAKCODE_GATEWAY_HOST=0.0.0.0` and open `http://<host-lan-ip>:3543` on a phone
  on the same Wi-Fi, no tunnel. Operator TOTP still gates the phone, but do this **only on a trusted
  network** — see the caveat next.

## The honest caveat: TOTP gates, it doesn't encrypt

Two boundaries, authenticated separately: the **phone** with TOTP, the **editors** with their derived
token (or the demoted static one). Both are **authentication**, not transport encryption. That's the
one seam in the zero-trust story: **identity** is checked on every hop, but **confidentiality** on the
local leg still leans on a trusted segment until `wss` lands. The
editor↔gateway hop is still plain `ws://`, so on a real network the token and the mirrored transcript
travel in cleartext — a non-issue on **loopback** (nothing hits the wire), fine on a **trusted LAN**,
and exactly why you keep a wide bind off networks you don't control. The **phone** leg is different: it
rides your private Dev Tunnel, which is TLS. Adding `wss` to the local hop **without shipping a private
key** is a genuinely interesting open design — the full discussion is in
[Part 4](https://www.likhansiddiquee.com/blog/security-by-construction#transport-encryption-an-open-design-suggestions-welcome).

## Keep your state across upgrades (Docker)

A container is ephemeral: recreate it and — without volumes — the **TOTP secret regenerates** (so
every paired phone must re-enrol), the tunnel sign-in drops, and the action log vanishes. Mount a
volume for the secret so pairing survives an image bump:

```bash
docker run -it -p 3543:3543 \
  -v cloakcode-mfa:/home/app/.cloakcode \
  -v cloakcode-devtunnel:/home/app/.local/share/DevTunnels \
  ghcr.io/lsiddiquee/cloakcode-gateway:latest
```

Relocate the secret or the log with `CLOAKCODE_MFA_SECRET_FILE` / `CLOAKCODE_GATEWAY_LOG_FILE` if
you'd rather point them at one shared volume — the gateway README has the full
[persistence table](https://www.npmjs.com/package/@cloakcode/gateway).

## When to bother

- **One project, one window?** Stay embedded. The gateway is moving parts you don't need.
- **Several windows / a dev container / two machines?** Run one gateway, point them all in, and open
  one **code-gated** link on your phone. That's the payoff.

Next up, **[Part 3 — Deploying the gateway](https://www.likhansiddiquee.com/blog/secured-deployment):** getting through dev
containers, WSL, and your LAN without carelessly binding `0.0.0.0` — the forward-don't-widen models
and where each fits.

---

**Links:**
[Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode) ·
[Gateway (npm)](https://www.npmjs.com/package/@cloakcode/gateway) ·
[Gateway (Docker)](https://hub.docker.com/r/likhan/cloakcode-gateway) ·
[Source (GitHub)](https://github.com/lsiddiquee/CloakCode)
