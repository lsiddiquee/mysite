---
marp: true
title: Task state is a call stack for agent work
description: A six-slide teaching carousel about shared task state for human-agent work.
theme: linkedin-portrait
paginate: true
footer: "likhansiddiquee.com | Task state is a call stack"
style: |
  :root {
    --forest: #174f3a;
    --magenta: #d71968;
    --silver: #c8ced1;
    --paper: #f7f5ef;
    --graphite: #202428;
  }

  section {
    box-sizing: border-box;
    padding: 96px 88px 104px;
    background: var(--paper);
    color: var(--graphite);
    font-family: "Aptos", "Trebuchet MS", sans-serif;
    font-size: 38px;
    line-height: 1.25;
    letter-spacing: 0;
    overflow: hidden;
  }

  section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 28px;
    height: 100%;
    background: var(--forest);
  }

  section::after {
    content: "";
    position: absolute;
    top: 70px;
    right: 74px;
    width: 72px;
    height: 18px;
    background: var(--magenta);
    box-shadow: 18px 18px 0 var(--magenta), 36px 36px 0 var(--magenta);
  }

  h1,
  h2 {
    margin: 0;
    max-width: 850px;
    color: var(--graphite);
    font-family: Georgia, "Times New Roman", serif;
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: 0;
  }

  h1 {
    font-size: 86px;
  }

  h2 {
    font-size: 68px;
  }

  h3 {
    margin: 30px 0 16px;
    color: var(--forest);
    font-size: 31px;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  p {
    margin: 28px 0 0;
  }

  strong {
    color: var(--magenta);
  }

  ul,
  ol {
    margin: 28px 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    margin: 18px 0;
    padding: 24px 28px 24px 78px;
    border: 3px solid var(--graphite);
    background: var(--paper);
    font-weight: 700;
  }

  li::before {
    content: "";
    position: absolute;
    top: 27px;
    left: 28px;
    width: 24px;
    height: 24px;
    background: var(--forest);
  }

  blockquote {
    margin: 40px 0 0;
    padding: 34px 38px;
    border: 0;
    border-left: 14px solid var(--magenta);
    background: var(--silver);
    color: var(--graphite);
    font-size: 44px;
    font-weight: 800;
    line-height: 1.16;
  }

  blockquote p {
    margin: 0;
  }

  code {
    padding: 4px 10px;
    border: 2px solid var(--graphite);
    border-radius: 0;
    background: var(--paper);
    color: var(--forest);
    font-family: "Aptos Mono", "Courier New", monospace;
    font-size: 0.82em;
    font-weight: 700;
  }

  footer {
    left: 88px;
    right: 88px;
    bottom: 34px;
    color: var(--graphite);
    font-size: 20px;
    letter-spacing: 0;
  }

  section[data-marpit-pagination]::after {
    color: var(--paper);
    font-size: 20px;
    font-weight: 800;
  }

  section.hook {
    padding-top: 132px;
    background: var(--forest);
    color: var(--paper);
  }

  section.hook::before {
    top: auto;
    bottom: 178px;
    left: 88px;
    width: 610px;
    height: 58px;
    background: var(--paper);
    box-shadow: 58px 58px 0 var(--silver), 116px 116px 0 var(--magenta);
  }

  section.hook::after {
    top: 0;
    right: 0;
    width: 180px;
    height: 180px;
    background: var(--magenta);
    box-shadow: none;
  }

  section.hook h2 {
    color: var(--paper);
    font-size: 94px;
  }

  section.hook p {
    max-width: 750px;
    color: var(--silver);
    font-size: 42px;
  }

  section.hook footer,
  section.hook::marp-pagination {
    color: var(--paper);
  }

  section.tension li:nth-child(-n + 3)::before {
    background: var(--forest);
  }

  section.tension li:nth-child(n + 4) {
    border-color: var(--magenta);
  }

  section.tension li:nth-child(n + 4)::before {
    background: var(--magenta);
  }

  section.shared ul {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    gap: 16px;
    margin-top: 56px;
  }

  section.shared li {
    display: flex;
    min-height: 210px;
    margin: 0;
    padding: 72px 20px 24px;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 30px;
  }

  section.shared li::before {
    top: 28px;
    left: calc(50% - 14px);
    width: 28px;
    height: 28px;
  }

  section.shared li:nth-child(2) {
    border-width: 6px;
    background: var(--silver);
  }

  section.limits li {
    min-height: 114px;
  }

  section.protocol ol {
    counter-reset: protocol;
  }

  section.protocol li {
    counter-increment: protocol;
    padding-left: 92px;
  }

  section.protocol li::before {
    content: counter(protocol);
    top: 18px;
    left: 24px;
    width: 46px;
    height: 46px;
    background: var(--forest);
    color: var(--paper);
    font-size: 28px;
    line-height: 46px;
    text-align: center;
  }

  section.resume blockquote {
    margin-top: 78px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 58px;
  }

  section.resume ol {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-top: 48px;
    counter-reset: resume;
  }

  section.resume li {
    counter-increment: resume;
    margin: 0;
    padding: 76px 16px 24px;
    text-align: center;
    font-size: 30px;
  }

  section.resume li::before {
    content: counter(resume);
    top: 22px;
    left: calc(50% - 22px);
    width: 44px;
    height: 44px;
    background: var(--magenta);
    color: var(--paper);
    font-size: 26px;
    line-height: 44px;
    text-align: center;
  }
---

<!-- _class: hook -->
<!-- _paginate: false -->
<!-- _footer: "" -->

## Task state is a call stack for agent work

Keep the parent task's return address when curiosity opens a tangent.

---

<!-- _class: tension -->

## Three steps from published

- Generate the hero.
- Wire the manifest.
- Build the route.
- **Tangent 1:** Why does the prompt name excluded colours?
- **Tangent 2:** Is a 1.63 MB PNG normal?

Both tangents started with the human.

---

<!-- _class: shared -->

## Either side can open a tangent

- Human starts a tangent
- Parent work stays checkpointed
- Agent starts a tangent

The initiator changes. The requirement does not: preserve the parent task and its next step before focus moves.

---

<!-- _class: limits -->

## Internal todo state is not shared task memory

- **Session-bound:** it may disappear with a new chat, compaction, restart, or agent switch.
- **Human-blind:** it cannot see a tangent that starts in the human's head.
- **Context-thin:** "normalize hero" omits evidence, rejected paths, blockers, and where to resume.

The work needs state both collaborators can inspect.

---

<!-- _class: protocol -->

## The repository protocol

`.local/scratch/task-state.md` is a plain Markdown task ledger shared through the workspace.

It holds the **current focus**, item **statuses + next step**, **open threads**, and **key findings**.

1. **Reconcile** it with the request and working tree before editing.
2. **Checkpoint** it before a tangent consumes the active context.
3. **Resume** from the waiting item and its next step.

Why `.local`? It is gitignored while unfinished, persists with the workspace, and is not promoted into shared project policy.

---

<!-- _class: resume -->

## Ask the workspace, not the transcript

> "What are my pending items?"

1. Reconcile
2. Choose
3. Continue

The ledger makes curiosity reversible. The full article link is in the post text.
