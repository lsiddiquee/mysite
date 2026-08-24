---
title: "The velocity microphone: AI amplifies unclear intent"
date: 2026-08-18
summary: "AI compresses tree-swing failures from weeks into minutes. Durable instructions, scoped authority, automated checks, and human release gates contain the risk."
tags:
  - agents
  - engineering-management
  - productivity
---

Twenty minutes of prompting. Three days of repair.

That complaint has become a verdict on AI: the agent wrote bad code, therefore the technology is
not ready. Sometimes the verdict is fair. Models invent APIs, miss edge cases, and produce designs
no experienced engineer should approve.

But look at the failure in the comic. The engineer wanted a wooden swing. The brief asked for a
"dynamic, scalable outdoor kinetic relaxation mechanism hanging from a plant limb." The agent
turned every loaded word into a plausible design decision, then built a jet-powered machine into a
tree. Nobody checked whether its interpretation still meant *swing* before the design became ten
thousand lines of code.

That is not a new class of failure. It is the old tree-swing cartoon with the waiting removed.

## The tree swing did not disappear. The waiting did

The original cartoon follows one need through a chain of people: what the customer described, what
the analyst understood, what the architect designed, what the programmer built, and what the
customer needed. Each handoff bends the intent a little further.

Agentic development shortens that chain. One engineer can now play customer, analyst, architect,
implementer, reviewer, and operator in one chat window. The communication problem did not leave. It
moved inside one person's brief and accelerated.

The old process took weeks, which was expensive. It also created accidental checkpoints. A design
sat in a document overnight. A developer questioned a strange requirement before spending a day on
it. A reviewer saw the first hundred lines before there were ten thousand. I have written about how
agents remove [the pauses that used to catch our
mistakes](https://www.likhansiddiquee.com/blog/agentic-ai-cognitive-tax/). This is the same loss,
viewed from outside the engineer's head.

An agent can cross the distance between a vague sentence and an integrated implementation before a
human notices that the first turn was wrong. The crash feels sudden because discovery moved to the
end while execution moved to the beginning.

## Ambiguity now compiles

I think of the agent as a velocity microphone. A microphone does not decide what was said. It raises
everything it receives: the signal, the room noise, and the feedback. An agent adds execution to
that amplification. It turns both the stated requirement and the gaps around it into code.

Three gaps do most of the damage:

- **The outcome is private.** The engineer can picture the swing but describes a category of
  mechanisms.
- **The solution space is open.** No boundary rules out motors, gyroscopes, a new framework, or a
  repository-wide redesign.
- **Proof is undefined.** Nothing says what evidence would demonstrate that the result solves the
  original problem.

The model must still return something, so it selects a reasonable direction. "Reasonable" is doing
dangerous work there. It means statistically coherent with the words and context, not agreed with
the person who supplied them.

Calling every wrong direction a hallucination hides that distinction. A hallucinated API is a
model failure. A coherent implementation of an unspoken assumption is an agreement failure. Both
need to be caught, but they do not have the same cause.

## Intent architecture is not a longer prompt

The answer is not five pages of prompt prose. More words can create more places for assumptions to
hide. Intent architecture means making the consequential decisions explicit and testable before
execution becomes cheap enough to outrun thought.

Take a ticket that says, "Make uploads resilient." An agent could add a queue, retry every request,
change the public API, or persist payloads to disk. Each choice can be defended. None is necessarily
what the product needs.

A usable brief has a different shape:

```text
Outcome: A dropped connection during a chunk upload recovers without restarting the whole file.

Why: Mobile users lose progress when a network handoff interrupts a large upload.

Boundaries:
- Change only the upload transport and its tests.
- Keep the public client API and server protocol unchanged.
- Do not retry finalization or any non-idempotent request.

Acceptance evidence:
- A failed chunk retries at most twice with the specified backoff.
- Cancellation stops the current request and prevents another retry.
- Existing upload, cancellation, and finalization tests still pass.

Before editing:
- Restate the intended behavior.
- List unresolved decisions and stop on any that affect data integrity.
```

The last two lines matter as much as the constraints. Clarification must happen before implementation,
not inside a postmortem. Asking the agent to restate the task exposes interpretation while it is
still a paragraph. Asking it to name unresolved decisions separates a known requirement from a
plausible guess.

The human then has to answer. Delegating the questions back to the same system without reviewing
them is not clarification; it is another round of autocomplete.

## Validate while the code is still small

Ten-times-faster generation cannot wait for the old end-of-task review. By then the first wrong
assumption has become a helper, three abstractions, forty call sites, and a migration.

The safer unit of work is one assumption that can be disproved cheaply:

1. Define one observable behavior and its boundaries.
2. Have the agent restate the intent and surface ambiguities.
3. Implement the smallest reversible slice.
4. Run the narrow test, type check, lint rule, or contract check that can reject it.
5. Inspect the diff against the stated boundaries.
6. Continue only after the evidence and the intent agree.

These checkpoints turn iteration into governance. A checkpoint after the first transport retry can
invalidate a bad policy in minutes. The same checkpoint after a repository-wide resilience refactor
becomes the three-day repair story.

The checks should run as the change grows, not after the agent declares itself finished. That means
writing acceptance tests before or alongside implementation, keeping types and lint rules strict,
and treating every unexpected file change as a design question. It also means budgeting work by
what a human can validate, not what an agent can generate. That is the same constraint behind
[planning for review instead of typing](https://www.likhansiddiquee.com/blog/sprint-planning-after-ai/).

## Governance starts before the first prompt

"Check your work" is a useful instruction. It is not an independent release gate. The same model,
working from the same context, can reproduce the same mistaken assumption in its implementation,
tests, and self-review.

But governance is larger than external validation. It is the control stack that carries intent into
the conversation, constrains what can happen inside it, and judges what is allowed to leave:

- **Repository instructions preserve system intent.** Architecture rules, coding conventions,
  ownership boundaries, and definitions of done remain available across sessions instead of
  depending on what one engineer remembers to paste into a prompt.
- **Agent and workflow files define the job.** Specialized roles, skills, prompt templates, allowed
  tools and subagents, handoffs, stop conditions, and stage-versus-publish authority narrow what an
  agent is being asked and trusted to do.
- **The task brief makes local intent testable.** The outcome, rationale, boundaries, acceptance
  evidence, and unresolved decisions turn a request into a contract for one change.
- **Capability controls limit the blast radius.** Least-privilege tools, path restrictions, secret
  isolation, network controls, and explicit approval for destructive or irreversible actions reduce
  what one mistaken interpretation can touch.
- **Hooks and automated checks reject bad artifacts.** Pre-existing tests, reviewed acceptance
  tests, types, lint rules, schema checks, dependency policy, security scans, and diff limits fail
  without needing the conversation to agree.
- **Release controls contain what code checks cannot prove.** Required review, branch protection,
  environment approval, staged rollout, telemetry, and rollback govern the remaining uncertainty.

These layers are not interchangeable. Instructions, agent files, and task briefs steer a
probabilistic system; they are durable context, not hard enforcement. Tool permissions constrain
capability. Hooks and CI judge artifacts. A human accepts the residual risk. Writing "do not modify
authentication" in an agent file is useful, but it is not equivalent to denying that access,
testing the security property, or requiring the owner to approve the change.

For a critical boundary, use more than one layer: state the intent, remove unnecessary capability,
test the property, and put an accountable reviewer at the release gate.

Not every change needs every gate. A reversible copy edit and an authorization migration do not
deserve the same process. The governing question is not how much code the agent wrote. It is how
expensive a wrong assumption would be after release.

That is why governance is not the brake on AI velocity. It is the mechanism that lets us use the
velocity more than once.

## The release gate stays human

Clear requirements do not make models infallible. An agent can still misunderstand a complete
brief, choose a poor algorithm, or pass tests that missed the real edge case. The harness makes
those failures diagnosable. When intent, boundaries, and acceptance evidence are explicit, we can
identify a model or tool failure instead of arguing about what somebody meant three days ago.

Accountability does not move with implementation. The agent can propose, question, implement,
test, and review. It cannot own the consequence of merging the change. The engineer or team that
controls the repository still decides whether the evidence is sufficient.

The tree-swing joke survived for decades because no single role caused the whole failure. AI
collapses those roles into minutes, but it does not remove them. Requirements, clarification,
validation, iteration, and release approval still exist. We either design them into the workflow or
discover them after the crash.

Twenty minutes to produce working code is a gift. Spend the first minutes deciding what *working*
means, then use the next ones to prove it before a reasonable guess becomes the architecture.
