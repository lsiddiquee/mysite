---
title: "Task state is a call stack for agent work"
published: false
description: "A shared task-state ledger lets you and an AI agent checkpoint tangents, preserve return addresses, and resume the original work after context shifts."
tags: ai, agents, copilot, productivity
canonical_url: https://www.likhansiddiquee.com/blog/task-state-call-stack/
cover_image: https://raw.githubusercontent.com/lsiddiquee/mysite/main/content/assets/task-state-call-stack-hero.jpg
---

I was one hero image away from publishing
[a post about sprint planning](https://www.likhansiddiquee.com/blog/sprint-planning-after-ai/).
Generate it, wire the manifest, build the route. Three steps, then done.

I opened the image prompt for one last look and found it arguing with itself. It named colours in the
same prompt that told the generator to avoid them. I asked why. That small question pulled us out of
publishing and into an audit of every image instruction in the repository.

The corrected render arrived as a 1.63 MB PNG. I asked another small question: is that normal? Now we
were comparing existing heroes, JPEG quality, chroma sampling, and edge artifacts. A second
investigation had opened inside the first task.

The agent did not start either tangent. I did. On another day the agent spots the neighboring defect
and asks whether to follow it. The risk is the same: the original task falls out of active context
while one of us follows the more interesting question.

At the bottom of this stack, the post still needed its manifest entry, route build, and removal of a
forward link to an unpublished part two.

We returned to all three because the task had a return address.

## Task state is a call stack

A to-do list records what remains. A call stack records more: the current frame, its local variables,
and the address where execution should return when a nested call finishes.

That is what `.local/scratch/task-state.md` does for my agent work.

In the analogy, the current frame is the immediate question. Its local variables are the working
hypothesis, evidence, rejected paths, blockers, and decisions made so far. Its return address is the
next step still waiting in the ledger.

Before either of us changes focus, the instruction tells the agent to checkpoint the ledger. The
tangent becomes the current work while the unfinished task remains recorded beneath it. When the
tangent closes, we update its result and resume the waiting next step.

In call-stack terms, the publishing task can be read like this:

```text
publish sprint-planning post
  -> create hero
     -> I notice excluded colours inside the positive prompt
        -> we inspect the prompt rules
        -> return: corrected sidecar
     -> I question the 1.63 MB render
        -> we audit the export settings
        -> return: normalized hero
  -> wire manifest
  -> remove unpublished forward link
  -> build and inspect route shell
```

The stack did not stop us from going deep. It made the deep dive reversible.

## The tangent can start on either side

Most descriptions of agent drift make the agent sound like the only source. It chases a neighboring
bug, reads too many files, or turns a local fix into an architecture review.

I interrupt the plan too. I notice a strange output and ask how it happened. I challenge an
assumption halfway through implementation. I open a related file while the agent is running and
bring a new concern back into chat. Sometimes the side question is more useful than the task that
exposed it.

From the work's point of view, ownership of the tangent does not matter. Focus changed while a parent
task remained unfinished. The parent needs a snapshot before the new question consumes the active
context.

This is why task state has to be shared. It is not the agent's private plan, and it is not my private
set of browser tabs. It is the handoff surface between our two attention streams.

## The internal todo tracker is not enough

An agent's internal todo tracker is useful. It can decompose the requested work, mark steps in
progress, and show whether the current turn is moving.

I do not treat it as durable task memory.

It belongs to the active agent session. It may not survive context compaction, a new chat, an editor
restart, or a switch to another agent. More importantly, it cannot see a branch that starts in my
head. If I inspect an image, question a design choice, or return after lunch with a different
hypothesis, the internal plan does not know until I explain the change.

A todo item also tends to preserve the action while losing the state around it. "Normalize hero"
does not say which settings were tested, why one candidate failed, what still needs visual judgment,
or where publishing resumes afterward.

The local task-state file is visible to both of us. I can correct it. The agent can update it. A new
session can read it before reconstructing the task from Git and a partial transcript. Because it
lives in the workspace rather than the chat, the work does not depend on one session remaining
alive.

## How I keep the stack

I do not rely on remembering to take a snapshot once the tangent has become interesting. This
repository's always-on
[context-persistence instructions](https://github.com/lsiddiquee/mysite/blob/main/.github/copilot-instructions.md#context-persistence-never-lose-work-on-tangents)
carry the protocol. Copilot reads that file as repository guidance, so the checkpoint triggers
arrive with each new session rather than remaining in the chat that may disappear.

The instruction is explicit:

- For any non-trivial, multi-step task, ensure `.local/scratch/task-state.md` exists before the
   first edit. Create it only when absent.
- If it already exists, read and reconcile it with the request and working tree. Preserve unfinished
   state; never truncate the file to start a new task.
- Record the current focus, in-flight items and their status, the next step, open threads, and key
  findings.
- Checkpoint before switching focus or deep-diving, when a new sub-issue appears, and after a
  meaningful step completes.
- Re-read and reconcile the file when resuming.
- When completed history makes the active file hard to scan, move it to
  `.local/scratch/task-state-completed.md` and promote any durable finding into tracked documentation
  in the same pass.

This is how I ensure snapshotting happens at the transition, not as cleanup after context is lost.
It is still an instruction, not a transactional runtime guarantee. Its advantage is that the rule
survives the session, the artifact is visible to both of us, and a missed checkpoint is reviewable.

The storage choice is part of the same instruction. This repository explicitly lists `.local/` in
`.gitignore` because the contents are local until promoted. A current hypothesis, unfinished frame,
or rejected path should not be pushed to every contributor as project guidance.

Gitignored does not mean disposable. The devcontainer bind-mounts the repository workspace from the
host. Rebuilding the container replaces the environment, not `.local/scratch/task-state.md` inside
that workspace. The stack is still there when the new container opens.

I do not use VS Code chat memory as that recovery layer. A transcript may remain visible, but a new
chat is not guaranteed to load it as working context; compaction can also remove the detail needed
to resume. The task-state file has a stable path that the repository instruction tells the next
session to read.

The ledger has no fixed schema. This run uses `Current focus`, `Ledger`, `Chosen metadata`, and
`Boundaries`; older states also use `Key findings`, `Remaining`, and `Gotchas`. The headings follow
the work.

There is no literal stack API or required `Return` field. I read `in-progress` as the top frame, a
pending item plus its next step as the return address, and open threads and findings as the state
needed to resume. Completing the tangent and returning to that pending item behaves like a pop.
Finished history moves into `task-state-completed.md`; reusable findings are distilled into their
tracked owner.

## I ask the session what remains

Most of the time I do not open the task-state file myself. I ask the session:

> What are my pending items?

The agent reads the ledger, reconciles it with the working tree, and gives me the unfinished items
with their current status. I choose one. That item becomes the current work, and the session already
has the findings, blockers, and next step recorded around it.

The question works in the same chat, after a context compaction, or in a new session because the
answer comes from the workspace artifact. I am not asking the model to recall an old conversation. I
am asking it to query shared state, then continue from the item I select.

## This is a protocol, not a file format

Markdown under `.local/` is how I implement the idea in these repositories. It is not the only way.
An issue, worktree note, session database, or orchestration system can carry the same state.

The direction matters more than the storage choice:

- The state is shared between the human and the agent.
- It survives longer than one chat or internal plan.
- A tangent records its parent return address before consuming the context.
- Resume begins by loading that state, not reconstructing it from the current diff.
- Completed frames leave the active stack.

Without those properties, changing the filename does not solve the handoff problem.

## Shared memory makes curiosity affordable

I wrote about AI acting as a
[velocity microphone](https://www.likhansiddiquee.com/blog/velocity-microphone/): it amplifies
unclear intent and returns the consequences faster. It also makes investigation cheap. A side
question can become a twenty-file audit before either of us feels the cost.

I do not want to remove that curiosity from the workflow. I want a reliable way back.

The ledger preserves the parent task's return address through context compaction, agent changes, and
my own detours.
