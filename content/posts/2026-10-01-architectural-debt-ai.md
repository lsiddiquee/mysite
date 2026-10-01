---
title: "Architectural Debt is the New Technical Debt"
date: 2026-10-01
summary: "AI can rewrite messy functions in seconds, but quick patches across service boundaries obscure who owns a fact. Guard domain contracts before generating code."
tags:
  - agents
  - software-architecture
  - engineering-management
---

Imagine a request to show payment status on an order page. An agent finds the order endpoint, adds a `paymentStatus` column to the orders table, copies a field from the billing response, and updates the UI. The tests pass. The ticket closes.

Which service owns the truth when a refund happens tomorrow?

If billing owns payments but orders stores a second status, someone now has to define how those values converge. A retry, an out-of-order event, or a partial failure can show a paid order as unpaid. The added code may be tidy. The decision about ownership is not.

That is architectural debt: the cost of a missing or compromised boundary, paid on every later change that crosses it. AI makes it easier to incur while making local code cleanup cheaper. The scarce skill is deciding what a system means and which part is allowed to say so.

## The marginal cost of code fell, not the cost of change

Generating a handler, test, and migration takes less typing than it used to. An agent can also rewrite an awkward function, remove duplication, and fill in boilerplate quickly. Those are useful gains. They do not make the output free: someone still has to review behavior, migrate data, deploy the change, and support it when production disagrees with the test fixture.

Lint errors and duplicate code still matter, especially when they obscure a bug. But a clean lint report says nothing about whether `paymentStatus` belongs on an order. The local quality of the patch and the global shape of the system are different questions. Faster patching shifts attention toward the question that cannot be answered by rewriting a file.

I wrote about the [velocity microphone](https://www.likhansiddiquee.com/blog/velocity-microphone/): AI amplifies unclear intent and returns the consequences faster. Here the consequence is not a conspicuously broken function. It is a plausible new source of truth.

## The easy path crosses the wrong boundary

An agent asked to make the order page show payment status will search for the code that renders the order page. The shortest path may be to extend the order model, because that is where the current request is being handled. No malicious reasoning is required. The task, the nearby code, and the tests all point at a local completion condition.

Then another feature reads `orders.paymentStatus` to decide whether to ship. A third updates it after a chargeback. Each change is defensible within its own ticket. Together they turn a display shortcut into a domain rule, and now neither orders nor billing can change its state model without coordinating with the other.

The same failure takes other forms: a shared database table becomes an unofficial integration API; a frontend duplicates an authorization rule; a "temporary" mapping layer becomes the place where two services disagree about customer identity. Generated code does not create these traps. It makes the easy path fast enough to take repeatedly before the coordination cost becomes visible.

## Guard the contract before generating the patch

For the order-page request, I would first ask: is payment status a billing fact or an order fact? Suppose billing owns it. The order page can request a billing-owned view or consume a deliberately defined projection. If it caches a projection, the contract must name its source, update mechanism, failure behavior, and acceptable staleness. Orders should not become an independent authority for the same status.

That decision changes the agent's task. Instead of "add payment status to orders," the request becomes: "display billing's payment status on the order page; do not add a writable payment field to the orders model; specify what the page shows when billing is unavailable." The constraint is small enough to review and concrete enough to test. A contract test can catch an unauthorized write or a missing unavailable state. It cannot choose the domain owner on its own.

For any domain boundary, put the contract in the instructions the coding agent actually receives: `AGENTS.md` or `copilot-instructions.md` for repository-wide rules, or a scoped `*.instructions.md` for the code it governs. Name who owns each fact and state transition, how other domains may read it, which writes and dependencies are forbidden, and what happens when the owner is unavailable. Before editing, have the agent identify the relevant owners and explain how its proposed change crosses their boundary. If the instructions are missing or conflict with the code, or the request needs a new owner or exception, it should stop and ask the user to decide. It must not treat the nearest model as permission.

Instructions make a boundary visible; checks make violations harder to ship. Where possible, add dependency rules, schema ownership checks, and contract tests for the allowed exchange and its failure path. Have the agent run those checks and report what they cover. They cannot prove that the domain model is correct, so a person still has to judge new ownership and consistency tradeoffs.

This is the boundary guardian's work: name who owns a fact, define the permitted exchange, and make violations visible in scoped instructions, tests, APIs, and review. The goal is not to forbid every cross-service dependency. It is to give an agent a durable constraint it can follow and a check it cannot wave away, so the next change does not silently invent a second model.

The same reasoning applies to planning. I argued that [sprint plans still point at an old bottleneck](https://www.likhansiddiquee.com/blog/sprint-planning-after-ai/). When implementation is faster, it is tempting to queue more small features. Before calling one small, check whether it adds a new owner, projection, or consistency rule. A one-line field can be the most expensive part of the feature.

Code generation has changed what I can finish in an afternoon. It has not removed the need to decide where a fact belongs. If I skip that decision, faster implementation means I can accumulate architectural debt faster too.

Where have you seen a tidy local change create a second owner for the same fact? What boundary would have caught it?
