---
title: 'Security by construction: your code stays on your machine'
date: 2026-07-29
summary: 'The threat model behind driving Copilot from your phone: zero code-sync, loopback binds, TOTP on every connection, and a pinned wss hop that fails closed.'
tags:
  - cloakcode
  - security
  - gateway
  - tls
---

_Part 4 of a series on CloakCode — observing and steering GitHub Copilot from your phone._
_([Part 1 — the why](https://www.likhansiddiquee.com/blog/your-copilot-is-waiting/) ·
[Part 2 — the gateway](https://www.likhansiddiquee.com/blog/the-standalone-gateway/) ·
[Part 3 — deployment](https://www.likhansiddiquee.com/blog/secured-deployment/).)_

Any tool that lets you "control your editor from your phone" earns a raised eyebrow, and it should.
The reasonable questions are: _Where does my code go? Who can reach my editor? What if the phone
channel is spoofed?_ CloakCode's answers aren't a policy page — they're baked into how it's built.
Here's the threat model in plain terms.

## 1. Zero code-sync — and it's architectural, not aspirational

The headline rule: **CloakCode adds no path that pushes, uploads, or syncs your workspace anywhere.**
No `git push`, no repo upload, no "connect your GitHub," no third-party cloud. This isn't a setting
you can leave off — there is **no such code path in the project**. Compliance is by construction, and
it's the kind of thing you can verify by reading the source (it's MIT).

What actually crosses the wire is the Copilot **transcript mirror** and your **replies** — the
question the agent is asking and the answer you tap. That's the whole payload.

## 2. Bounded, self-owned egress

A subtler promise sits under the first one: CloakCode doesn't open a **new** door to send your code
somewhere it wasn't already going. It **mirrors** Copilot's own transcript and **relays your prompts
back into Copilot** — the same data flows Copilot already runs. It doesn't quietly harvest your
workspace to feed some other model. If it ever runs a model loop itself, it does so through **your
own** consented entitlement (Copilot via VS Code's language-model API, or your own agent) — never a
third party you didn't choose, and never by auto-scraping files you didn't offer.

The mental model: CloakCode is a **remote control for a session you already have**, not a new pipe to
the cloud.

## 3. Two doors, and neither of them is the network

Everything binds `127.0.0.1` by default. The embedded bridge has no host override at all. The
standalone gateway has two role-scoped listeners — **operator** (your phone, `:3543`) and **provider**
(your editors, `:3544`) — and a client that knocks on the wrong one is refused before anything else
happens.

Remote access is **exclusively** through a tunnel _you_ own:

- The Dev Tunnel CloakCode hosts is **private** — sign-in required to open the link, **never**
  anonymous or public.
- There's no CloakCode server in the middle. The tunnel terminates at _your_ infrastructure.

The posture underneath is **zero trust**: reaching the URL earns a client nothing. The network is
never the trust boundary. Every connection — human or machine — proves who it is, on every connect,
however it got there.

## 4. Two authenticated boundaries — the phone and the editor

CloakCode authenticates its two boundaries **differently**, because one is a human and the other is a
machine.

**The phone (operator) → your hub: TOTP.** When the hub is exposed — a tunnel is up, or the operator
listener is bound wide — the phone must authenticate with a **time-based one-time code**, the same
6-digit codes your authenticator app already shows. A valid code returns a signed, stateless **session
token** (12 hours, or 30 days with "remember this device") the browser stores, so you're not retyping
codes all day. Reflected or sniffed codes are useless: a **replay guard** rejects a code's 30-second
step once it's been used, and a connection **locks out** after a few bad codes.

Crucially, **enabling MFA actually means verifying it.** A freshly generated secret is _unconfirmed_,
and while unconfirmed the hub serves **only pairing** — every real request is refused until you scan
the QR and enter one code. So there's no window where MFA is "half on" and the session list is exposed
to an unauthenticated phone. Setup is browser-driven (the app shows the QR), or — if you'd rather the
pairing secret never traverse the tunnel even once — a **strict** mode shows the QR only on your
gateway console / in VS Code and the browser just submits the verify code. Locked out? Regenerate the
secret (`CLOAKCODE_MFA_RESET=1`, or a VS Code command) and re-pair.

**The editor (provider) → your hub: a token, not the secret.** Editors registering as providers
authenticate too — and because there's a human at that VS Code, they use the _same_ handshake: you
enter a code once, the extension exchanges it for a token and stores it in the OS keychain, per
gateway URL. It **never holds the TOTP secret** — only a derived, long-lived token. Present a bad
credential and the gateway drops you (`provider.auth_reject`). A static shared secret
(`CLOAKCODE_GATEWAY_TOKEN`) still works as a **demoted escape hatch** for headless providers with no
human to type a code. Either way it's machine-facing and **never** shown to the phone.

Two boundaries, two factors, kept in separate blast radii — the TOTP secret lives only on the hub and
your authenticator; a provider only ever holds a token.

_(In embedded mode — the extension hosting its own loopback bridge — there is no editor↔gateway link
at all; the phone connects straight to the bridge, and operator TOTP is the whole story.)_

## 5. Transport encryption: how a self-signed gateway earns trust

Authentication is not confidentiality, and for a while CloakCode was honest about having only the
first on the editor hop. That gap is now closed, and the way it closed is the most interesting
engineering in the project — so it's worth more than a bullet.

**The constraint.** The phone leg was never the problem: it rides your private Dev Tunnel, whose
ingress terminates real TLS. The editor leg is harder, because the gateway is software **you** run.
A locally-distributed app **cannot ship a TLS private key** — publish it once and it's everyone's. So
the certificate has to be generated on your machine, which means it's self-signed, which means the
extension has to decide whether to trust it without a public CA's help.

**What the gateway does.** On first run it generates a certificate and persists it under
`~/.cloakcode` — private key mode `0600`, never logged, surviving restarts so you pair each editor
once. Bring your own with `CLOAKCODE_TLS_CERT_FILE` / `_KEY_FILE`. The provider listener serves `wss`
with it **by default**.

**Two ways a gateway earns trust, with deliberately nothing in between.** Either a **real authority
vouches for it** — the cert chains to a root the machine already trusts, in which case you configure
nothing and validation is exactly a browser's — or **you vouch for it**, by its **SHA-256
fingerprint**, carried out-of-band. What there is no third option for is _the gateway vouching for
itself_.

### The pin has to arrive from somewhere else

The failure mode to avoid is seductive and common: connect, take whatever certificate answers, remember
it, call it "pinning." That's **trust on first use** — it only authenticates the _second_ connection
onward, and it authenticates it to whoever got there first. CloakCode does not do this, anywhere.

So the pin travels **with the address, in one pairing URL**:

```text
wss://host.docker.internal:3544#fp=82F20036F2E8…
```

Three deliberate choices in that one line:

- **One value, not two.** An address setting and a fingerprint setting can drift — a stale pin against
  a new host, or a one-character typo in a field nothing cross-checks. (That cost real debugging time
  before it was fixed.) A separate `gatewayCertFingerprint` still exists for people who prefer a bare
  URL, but a value there that **contradicts** the URL's pin is **refused**, not resolved by precedence
  — silently preferring one would be a trust decision you never saw.
- **A fragment, not a query string.** Fragments are never transmitted. The pin doesn't reach the
  server, a proxy, or a log; the extension splits it off locally. (The codec lives in the shared
  protocol package so both ends agree on exactly one parse.)
- **Read from an already-trusted channel.** You get the URL from the gateway's own console, or from
  the PWA's **Connect an extension** view — which sits behind the tunnel's sign-in _and_ your operator
  TOTP. Genuinely out-of-band. And rotation stops being painful: the current pin is always one
  authenticated tap away.

Note what the pairing payload does **not** contain: the certificate. Only the pin. The extension
obtains the certificate itself — because the pin is the entire trust decision, and shipping the cert
alongside it would just be a bigger thing to get wrong.

### Then TLS fights you twice

Getting from "I have a fingerprint" to "this connection is verifiably that gateway" took two rounds
with Node and VS Code, and both are worth knowing if you're building something similar.

**Round one: you can't pin a self-signed cert the obvious way.** Set `rejectUnauthorized: true` and
Node rejects the self-signed chain _before_ any of your code runs. Set it to `false` and
`checkServerIdentity` is **ignored entirely** — the hook you were going to pin in never fires. The
naive implementation is therefore either "always fails" or "verifies nothing," and the second one
looks like it works.

The way out is to **fetch the certificate first**, over a direct `tls.connect`, verify the configured
fingerprint against it, and then use that exact certificate as the **CA** for the real connection.
Everything after the check is strictly stronger than a bare pin: full chain validation against the
pinned certificate on **every** connection, `rejectUnauthorized` back on, and the fingerprint
re-checked on each handshake. If the probe reaches a server presenting the wrong certificate, it fails
closed before a single frame is sent.

**Round two: TLS session resumption silently skips the pin.** On a resumed session the server presents
**no certificate at all** — `getPeerCertificate()` returns `{}` and `checkServerIdentity` isn't
called. In fingerprint-only mode that rejects a _legitimate_ gateway on every reconnect after the
first; in CA-pin mode the fingerprint check is **quietly skipped**. Neither is acceptable, so whenever
a fingerprint is configured the extension supplies its own agent with `maxCachedSessions: 0`, forcing a
full handshake every time. A pin that a transport optimisation can skip is not a pin.

There's a sting in the tail: under VS Code's default proxy support, the host **discards an
extension-supplied agent for every host except `localhost`** and substitutes its own session-caching
one. So the "just don't cache sessions" fix evaporates for exactly the gateways that need it — any
gateway reached by another name. That's what makes the fetch-and-self-provision approach load-bearing
rather than merely tidy: request _options_ survive the substitution even when the agent doesn't, so
pinning the fetched certificate as the `ca` keeps working regardless.

### Failing closed, and not helping the attacker

A pin failure is a **hard stop**. It raises a distinct error — not the generic "unreachable" — logs a
mismatch, shows a notification, and starts **no** bridge. It explicitly does _not_ fall back to the
embedded bridge, because that would hide "something other than your gateway answered" behind a setup
that looks like it's working. Only genuine unreachability (refused connection, timeout) falls back.

One small detail with a real rationale: the error names the presented and configured fingerprints
**truncated to 12 hex characters**. That's enough to tell a substituted certificate from one that was
never presented, and to tell which pin was in effect — but not enough to paste. The presented value is
derived from bytes the **remote chose**; printing it in full would let whatever answered put a
ready-to-paste "fix" in front of you, and turn your pin back into trust-on-first-use by social
engineering. The real pin is only ever read out-of-band.

Finally, the `gatewayUrl` and fingerprint settings are **machine-scoped**, so opening a repository
can't redirect or unpin your gateway link.

### About that rejectUnauthorized: false line

There's a line in the probe that turns certificate validation off. It is the single most alarming
line in the codebase, any scanner worth running flags it as high severity, and it should — a reader
who stops there has every reason to assume the worst. So let's not leave it there.

The dangerous version of this line is the one where turning validation off is the **end** of the
story: connect to anything, talk to it. Here it's the **first half** of a check that's stricter than
the one it replaces. The probe carries no application data — it exists only to see a certificate. The
fingerprint is compared before the certificate is handed back, and a mismatch throws rather than
returns. The connection that actually carries your prompts is a second, separate one, with
`rejectUnauthorized: true` and that verified certificate installed as the **only** acceptable CA. Off
then checked, not off and done. And a pin authenticates _one exact certificate_ rather than trusting
roughly 150 root authorities never to have mis-issued.

### So can someone sit on the wire and intercept this?

No — and it's worth walking the attacker through it, because "validation is off" makes it sound like
the answer must be yes.

Answer the probe with your own certificate and the fingerprint doesn't match, so it throws before a
single frame of application data exists. Replay the _real_ certificate — it's public, you can just
grab it — and you still can't complete a handshake, because you don't have the private key it proves
possession of, and that key never leaves the gateway's mode-`0600` file. Wait for a reconnect hoping
to catch a resumed session with the check skipped: resumption is disabled whenever a pin is
configured, precisely so that can't happen.

Which leaves exactly one move: **be the source of the pin**. This is usually where security writing
waves at "read it out-of-band" and moves on, so here is concretely what that means in CloakCode. You
copy the pairing URL out of the **Connect an extension** view of your own PWA — a page your browser
reached over the Dev Tunnel, over publicly-trusted TLS it validated the ordinary way, behind the
tunnel's sign-in **and** your operator TOTP. So the hand-off is authenticated by the public PKI plus
two of your own factors before you ever see the fingerprint, and nobody on the wire can rewrite it in
flight. The pin then travels as a URL **fragment**, which is never transmitted anywhere; it goes from
that page into your extension settings and nowhere else. There is no window in which an
unauthenticated stranger gets to supply the value.

Being honest about what's left: you are trusting the tunnel provider you chose and signed into, and
the machine you paste on. Those are real, and they're also the trust you already extended by using a
tunnel at all — a categorically bigger compromise than sitting on a network. What has been removed is
the ordinary one: the anonymous first connection that gets believed.

That's also why we didn't silence the alert in the source. A `// codeql[…]`-style pragma in the most
security-critical module in the codebase is exactly the artifact you don't want to normalise — the
next reader can't tell a considered exception from a shrug. It's dismissed where the alert lives,
with the reasoning attached, and the reasoning is written down in the repository's security docs,
including the part that matters most to whoever touches this next: **don't "fix" it by deleting the
probe.** Without it, fingerprint-only pinning breaks on every reconnect, for the proxy-agent reason
two paragraphs up.

## 6. Message provenance — so reflected text is never "trusted user intent"

This one came straight from a bug we hit in testing: a **staged** prompt round-tripped through the
system and nearly got treated as if _you_ had typed it. Prompt-injection risk in miniature.

The fix is a rule the whole system enforces: **every message carries a source tag** —
`genuine-local-user`, `remote-operator`, or `cloakcode-staged`. Reflected or staged text is never
promoted to trusted user intent just because it came back around. When the system is about to act on
"what the user said," the provenance tag decides whether that's actually true.

## 7. Never log secrets, tokens, or raw code

Logging is **local only** (View → Output → _CloakCode_) — there's **no telemetry**, nothing shipped to
a cloud. And the logs are redaction-minded by design: secrets, tokens, and raw code/prompts don't get
written out. Turn the verbosity up for debugging and you get correlation ids and routing detail, not
your source.

## 8. The Copilot hook only notifies

To surface a pending tool call the instant it appears, CloakCode installs a small Copilot **notifier
hook**. Worth being precise: that hook **only notifies**. It never approves or denies a tool call on
its own. It exists to light up the "something's waiting" overlay — the decision is always yours, made
explicitly.

## Honest limitations (because "security by construction" cuts both ways)

- **The operator listener has no TLS of its own.** It's plain HTTP/WS, and it's fine because it sits
  on loopback behind your private tunnel, which supplies real TLS. Bind it wide with
  `CLOAKCODE_GATEWAY_HOST=0.0.0.0` and you've traded that away: TOTP still gates _who_ connects, but
  your session list and transcripts are readable on that segment. The gateway prints an **INSECURE
  MODE** banner and surfaces it in the UI, worded as a loss of _confidentiality_, not of access
  control. Trusted networks only.
- **Plaintext on the provider hop is still available, and still a downgrade.**
  `CLOAKCODE_PROVIDER_INSECURE=1` serves the editor listener as plain `ws://`. A passive sniffer then
  recovers the **provider token** — which is replayed on every reconnect — and the whole mirrored
  transcript. It exists for least-friction setup on a segment you control; it is not the default for
  good reason.
- **The pairing window trusts your local network.** In the default browser-driven enrolment, the TOTP
  QR is served over the bridge during first-run pairing. That's a deliberate trade: you set this up on
  a network you control, and the point is to be secured _before_ the link goes public. If you'd rather
  not, `strict` enrolment keeps the secret off the wire entirely.
- **Provenance is enforced where decisions are made, not stamped on every byte.** The tags gate the
  paths that matter today; carrying them structurally through every message shape end-to-end is a
  known, tracked piece of work rather than something already finished.

None of that is hidden in the fine print; it's the reason the defaults are loopback, private tunnel,
and `wss` with a pin.

## The one-paragraph version

Your code never leaves your machine because there's no code to leave — CloakCode moves the
_conversation_, not the _repository_. Both listeners are loopback by default; the phone gets in only
through a private tunnel you own and a **TOTP code** (verified at enrolment, resumed with a signed
token); your editors get in over **`wss` with a certificate pinned from a fingerprint you copied out
of the app itself**, over the tunnel's validated TLS and behind your own sign-in — failing closed if
anything else answers; every message is provenance-tagged so reflected text can't
impersonate you; and nothing is logged to the cloud. "Remote control for the session you already
have" — with the doors that matter kept shut.

Next: **Part 5 — Under the hood** — how CloakCode observes a live Copilot session with no special
APIs, and how it answers a blocker without ever touching your code.

---

**Links:**
[Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode) ·
[Gateway (npm)](https://www.npmjs.com/package/@cloakcode/gateway) ·
[Gateway (Docker)](https://hub.docker.com/r/likhan/cloakcode-gateway) ·
[Source (GitHub)](https://github.com/lsiddiquee/CloakCode)
