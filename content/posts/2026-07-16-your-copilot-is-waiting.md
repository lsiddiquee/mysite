---
title: "Your Copilot agent is waiting for you — and you're not at your desk"
date: 2026-07-16
summary: "Copilot stalls waiting on one approval while you're away — CloakCode mirrors your live session to your phone so you can unblock it with a tap, without your code ever leaving your machine."
tags:
  - copilot
  - cloakcode
  - vscode
---

_Part 1 of a series on CloakCode — observing and steering GitHub Copilot from your phone._

## The 20-minute stall

You know the moment. You give Copilot a real task — "migrate this module to the new API,
update the tests, and fix whatever breaks" — hit enter, and watch it start working. It reads
files, edits code, runs the test suite. It's going to take a while, so you get up. Coffee.
A meeting. Lunch.

You come back twenty minutes later and Copilot has done… four minutes of work. Then it stopped.

Somewhere near the top of that transcript is a single line waiting on _you_:

> **Run `npm run migrate:db`?** \[Allow] \[Deny]

or

> I found two `User` types — which one should the new client import?

The agent didn't fail. It didn't get stuck. It did exactly the right thing: it hit a decision
it wasn't allowed to make on its own, asked, and **waited**. Politely. For twenty minutes.
While you were three rooms away.

That gap — between "the agent needs one small thing from me" and "I happen to be sitting in
front of the editor" — is where a huge amount of agent time quietly evaporates.

## Why the obvious answers don't fit

"Just use Copilot on the web / the CLI," you say. Sometimes that works. Often it doesn't:

- **Your repo isn't on GitHub.** It's a client's GitLab, an internal monorepo, a folder on your
  laptop. The web experience assumes github.com; your code doesn't live there.
- **You're using your own models or setup.** The remote flows are opinionated about where and
  how the agent runs.
- **The session is _already running in your editor._** It has your open files, your context, your
  chat history. You don't want to restart it somewhere else — you want to answer the question it's
  asking, right now, in the session that's already mid-task.

And there's a bigger reason people don't reach for a remote option at all: **to drive an agent
from "somewhere else," your code usually has to _go_ somewhere else.** Upload the repo, sync to a
service, push to a branch. For a lot of us — client work, proprietary code, "this never leaves my
machine" policies — that's an immediate no.

So the status quo is: the most powerful thing about agentic coding (it works while you don't) is
capped by the least powerful constraint (you have to be at the keyboard to unblock it).

## A different framing

Here's the reframe that started CloakCode:

> You don't need to move the agent. You need to move the **one decision** it's waiting on.

The agent is already running, in the tool you already use, with all your context. The only thing
missing is a way for _you_ — wherever you are — to see that it's blocked and give it the one answer
it needs. A tap. "Allow." "Use the second `User` type." "Stop, and do it this way instead."

That's a tiny channel. It doesn't need your codebase. It needs the **question** and your **answer**.

## Enter CloakCode

[CloakCode](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode) is a VS Code
extension that mirrors your **existing** GitHub Copilot chat to a phone-first web app — so you can
watch a session live, and unblock or steer it from your phone, **without your code ever leaving your
machine.**

Concretely, from your phone you can:

- **See** your live Copilot sessions and transcripts — and get notified the moment one is blocked.
- **Answer** a question, or **steer** the agent with a new instruction.
- **Stop** a runaway turn, or **queue** the next message.
- **Approve or deny** a tool call — the "Run this command?" prompts — with a tap.

…while you keep using VS Code's own Copilot UI at your desk. Pick it up on the phone, drop back to
the desktop. Same session, no context lost.

### The part that matters most: zero code-sync

This is the whole point, so it's worth being blunt about it. **CloakCode adds no path that uploads
your workspace anywhere.** It doesn't push to GitHub. It doesn't sync your repo to a service. What
crosses the wire is the Copilot transcript mirror and your replies — over **localhost** and **your
own private tunnel**, not through any third party. Your code stays exactly where it is.

### How it works, briefly

- A tiny **bridge** runs inside VS Code, bound to `127.0.0.1`, and serves a phone-friendly app.
- It **mirrors** your Copilot session and detects blockers (an interactive tool call that's
  waiting for input).
- Your phone reaches it through **your own** private tunnel — a sign-in-required Dev Tunnel you
  host, never a public endpoint.

That's it. No account to create on our side. No repo upload. No "connect your GitHub."

## Back to that stall

Rewind the coffee run. This time your phone buzzes: _CloakCode — a session needs you._ You glance
at it in the hallway. **Run `npm run migrate:db`?** You read the command, tap **Allow**, and slip
your phone back in your pocket. By the time you're back at your desk, the migration ran, the tests
are green, and the agent is halfway through the next file.

Twenty minutes of dead time → a two-second tap. That's the entire pitch.

## Try it

CloakCode is live and open source (MIT).

**Install the extension** from the VS Code Marketplace:

> [CloakCode — Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode)

or from the command line:

```bash
code --install-extension rexwel.cloakcode
```

Reload VS Code, then run **CloakCode: Show Phone Link** from the Command Palette (`Ctrl/Cmd+Shift+P`).

The bridge binds to `127.0.0.1`, so **for phone access you need a way in from outside that loopback** —
and which side of it you land on depends on where VS Code is running:

- **Cloud Codespaces:** VS Code forwards the port to a phone-reachable URL — the link opens on your
  phone as-is.
- **Everything else — local VS Code, a dev container, or WSL:** the embedded bridge listens on
  `127.0.0.1` only, so a phone can't reach it directly. Enable a private Dev Tunnel
  (`cloakcode.tunnel: devtunnel`) and run **CloakCode: Set Up Phone Tunnel**. If the `devtunnel` CLI
  isn't there yet, CloakCode offers a one-click **Install in terminal** that runs the official
  installer for your OS (`curl … aka.ms/DevTunnelCliInstall | bash`, `brew`, or `winget`), then walks
  you through the `devtunnel` sign-in and hands you a phone-reachable URL with a QR to scan. It runs
  the install **where the extension runs** — your local machine for plain VS Code, but **inside WSL or
  the dev container** when VS Code is attached to one, not the Windows host — so it lands in the right
  place automatically (it's a visible terminal, nothing hidden).

  _Same Wi‑Fi and happy to bind your LAN? The standalone gateway can listen on `0.0.0.0`, so a phone
  reaches it at `http://<your-lan-ip>:3543` with no tunnel — on a **trusted** network only (there's
  no app-layer auth yet). More on that in [Part 2](https://www.likhansiddiquee.com/blog/the-standalone-gateway)._

Running several VS Code windows or machines and want **one** phone endpoint for all of them?
Multiplexing multiple CloakCode instances through a standalone gateway is covered in
**[Part 2 — The standalone gateway](https://www.likhansiddiquee.com/blog/the-standalone-gateway)**.

**Source:** [github.com/lsiddiquee/CloakCode](https://github.com/lsiddiquee/CloakCode)

## What's next in this series

This post was the "why" — and the **Try it** section above is your five-minute setup. The next ones
go deeper:

- **[Part 2 — The standalone gateway](https://www.likhansiddiquee.com/blog/the-standalone-gateway):** one hub for many windows and machines, via `npx` or Docker —
  when and why you'd run the hub outside the editor, and how the extensions connect in.
- **Part 3 — Deploying the gateway:** getting through dev containers, WSL, and your LAN without
  carelessly binding `0.0.0.0` — the forward-don't-widen models, and where each fits.
- **Part 4 — Security by construction:** the threat model spelled out — zero code-sync, a
  loopback-only bridge, a private (sign-in-required) tunnel, message provenance, and never logging
  secrets or raw code. Why "drive it from your phone" doesn't mean "trust us with your codebase."
- **Part 5 — Under the hood:** how CloakCode observes a Copilot session with no proposed APIs, and
  how it answers a blocker without ever touching your code.

CloakCode is open source (MIT). If the 20-minute stall sounds familiar, that's who it's for.

---

**Links:**
[Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode) ·
[Gateway (npm)](https://www.npmjs.com/package/@cloakcode/gateway) ·
[Gateway (Docker)](https://hub.docker.com/r/likhan/cloakcode-gateway) ·
[Source (GitHub)](https://github.com/lsiddiquee/CloakCode)
