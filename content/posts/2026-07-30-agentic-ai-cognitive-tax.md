---
title: "The 10x paradox: agentic AI's hidden cognitive tax"
date: 2026-07-30
summary: "Agentic AI made me ten times more productive and deleted the pauses that used to catch my mistakes. Why the friction was a feature, and how to put it back."
tags:
  - copilot
  - agents
  - productivity
---

Agentic tools made me something like ten times more effective than I was a year ago. A design I can
describe in a sentence comes back as working code before I have finished thinking about it. What I
ship in one good afternoon used to be a two-week sprint.

My output scaled. My biology did not. We did not automate the work so much as compress time, and the
thing that got compressed out was the room to breathe.

## Your hands used to be the bottleneck, and that was the feature

Before agents, the work had friction built into it. Typing code by hand, drawing an architecture on
a whiteboard, waiting on a build: all of it was slow in a physical, unavoidable way.

That slowness was doing real work. While you were typing line 50, some part of you was still chewing
on line 10, noticing that the logic did not hold, quietly correcting the shape of the design before
you got to the end of it. The bottleneck in your hands was a review pass you never had to schedule.

Agents removed it. The thought forms, the agent executes, a refactor across forty files lands in
five seconds. There is no gap left between intent and result, which means there is no gap left in
which to notice you were wrong. What used to be background reflection is now foreground oversight,
running without a break.

## The "one more prompt" slot machine

The loop is instant, so it is hard to walk away from.

- Prompt 1 gets you a good 80% baseline.
- Prompt 2 handles the edge cases and bends the architecture a little.
- Prompt 3 fixes the bend and moves the original intent while it is in there.

Stepping back to look at the whole thing costs minutes. The next pull costs ten seconds. That
comparison only ever has one winner, so you stay in the loop chasing the version that finally
matches what you meant, and the chase feels like progress because something new appears every time.

## Parallel agents, fragmented attention

Then you notice you do not have to wait at all. A design agent in one window, a refactor in another,
test generation in a third. I built [a whole gateway around running several agent sessions at
once](https://www.likhansiddiquee.com/blog/the-standalone-gateway/), so I get to enjoy this failure
mode personally.

On paper that is orchestration. In practice it is context whiplash. Each workflow holds a different
half-finished mental model, and you are the only place the three of them meet. You stop being the
person making the thing and become a router with an architectural opinion, trying to keep one intent
coherent across three transcripts that are all moving while you are not looking.

## Put the speed bumps back on purpose

Being a 10x engineer means making 10x the design decisions per hour. The tiredness at the end of
that day is not from the lifting; the lifting is what got automated. It is from judgment, delivered
at a rate nothing about us was built for.

So I put the friction back by hand:

- A hard limit of three prompts on one thread before I stand up.
- One major agentic workflow at a time, never three.
- Five minutes of human compile time after a large generation, before I read a line of what came
  back.

Output scales to whatever the tooling allows. Judgment does not, and judgment is the part that
decides whether any of that output was worth generating.
