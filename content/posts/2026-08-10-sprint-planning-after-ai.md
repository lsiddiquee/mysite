---
title: "Your sprint plans a bottleneck that left"
date: 2026-08-10
summary: "Story points, dependency arrows, and frozen API contracts were built around slow typing. AI moved that bottleneck, and the plan still points at where it was."
tags:
  - agents
  - productivity
  - engineering-management
  - agile
  - api-contracts
---

Refinement. Ninety minutes, six people, one story: an endpoint, a typed client, and a form that
posts to it. I have sat on both sides of that meeting and I have run it.

Then you describe the shape to an agent and all three land before the invite would have ended.
Nine person-hours spent scheduling an afternoon.

Nobody in that room is foolish. They are running a process that was correct in 2015 and has not
been audited since.

## Story points measure a thing that stopped varying

A point proxies effort, and effort was worth estimating because it varied: a three and a thirteen
were different weeks.

For a large class of work that spread collapsed. Scaffolding, adapters, the fourth CRUD surface
this quarter, all of it lands in the same afternoon whether you called it a three or a thirteen.
The estimate still gets produced, argued over, and burned down. It stopped carrying information.

What did not collapse is the part nobody sizes. Deciding whether the feature should exist. Getting
a security review. Reading the diff carefully enough to sign your name to it. Those are the
expensive hours, and there is no column for them on the board.

## The dependency graph is an insurance premium

The backend team delivers the endpoint in sprint 3. The frontend team consumes it in sprint 4, and
spends sprint 3 on something less valuable so the sequence holds.

That ordering is insurance against rework: the frontend builds against a guess, the guess is wrong,
a week is lost. When a week was the claim, a sprint of sequencing was a reasonable premium.

The claim is now an afternoon. The premium is still a sprint, at least for teams who share a repo.

## Codegen told you what broke. It never fixed it

The frozen API contract is the same trade in a more respectable costume. Contract-first buys two
teams the right to move at once, and pays for it by committing to the interface at the moment you
understand the problem least.

We have had generated clients for a decade though. OpenAPI, NSwag, protobuf. If codegen made schema
changes safe, why did anybody still freeze?

Because codegen was the enabler, not the cure. It produced the error list; a human still spent the
afternoon reconciling forty call sites, updating fixtures, and rewriting the UI that assumed the old
shape. That leftover reconciliation is why teams kept freezing the schema and kept budgeting an
integration sprint.

Agents removed the reconciliation. The tooling was already in place; this is what put it on
steroids. I move a schema at 14:00, the generator updates both sides, the compiler lists the seven
call sites, the agent fixes them, I read the diff at 14:20. Changing an interface costs reading now,
not typing.

So keep the contract, internal ones included: a declared interface is what makes a module testable
in isolation. Removing it does not buy freedom, it buys an implicit interface nobody can test.

Drop the freeze. Confirm the shape, agree out loud that it can still move, build both ends in the
same sprint, and let CI prove the fit continuously.

This stops at one question: can you regenerate every consumer? Public API callers, partner
integrations, and lakehouse tables queried by people you will never meet say no, and they get
versioning and a deprecation window. That is a blast-radius argument. The freeze we inherited is a
scheduling argument.

## Everything sped up, not by the same multiple

AI did not make delivery ten times faster across the board. It made one activity, producing
plausible code, close to free, and made several others cheaper by a much smaller factor.

Review agents are real and they work. One reads the diff before I do, flags the injection I would
have skimmed past, drafts the summary I would have written. Others turn a rambling requirements
conversation into something a team can argue about. I use all of it.

It is not the same multiple. Generation went up by orders of magnitude. Review went up too, then hit
a ceiling: a second reader who never gets tired is worth a great deal and is still not the person
whose name goes on the change. The security sign-off, the environment provisioned on Thursday, the
approver on leave: those did not move at all.

Three different rates on one path. Speed up the part agents own by a hundred and the part your
process owns by one, and the process becomes most of your elapsed time. Corporate process is the
unaccelerated fraction, and it is now the product.

What is left is not typing, and it is not even reading. A review agent can tell you the diff is
sound. It cannot be accountable for it. That belongs to one tired person, which I have called [the
cognitive tax of working at agent
speed](https://www.likhansiddiquee.com/blog/agentic-ai-cognitive-tax/). No board I have seen has a
column for it.

## Plan the scarce thing

- **Size by reversibility, not effort.** A story with three one way doors deserves the ninety
  minute meeting. A CRUD surface does not.
- **Budget review, not points.** Cap work in flight by what a human can read this week. That number
  is far smaller than what an agent can finish.
- **Stop budgeting for integration.** The integration story was always a bet that the contract
  would be wrong, and you no longer have to place it.
- **Track wait time.** Map a feature from idea to production, marking touch time against waiting.
  The ratio wins the meeting that reasoning did not.

If moving the interface is cheap and one person can build both ends of the slice, the split into a
backend team and a frontend team is the next thing to justify, and that is its own post.

We automated the typing and kept the meeting that scheduled it. The board still shows a bottleneck
in the hands of engineers, and the engineers left that bottleneck a year ago.
