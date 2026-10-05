---
title: "The Micro-Feature Fallacy: How AI Shrinks Scope but Bloats Systems"
date: 2026-10-05
summary: "Cheap AI code generation makes niche features easy to approve. Evaluate their lifetime configuration, compatibility, and support costs before adding a toggle."
tags:
  - agents
  - software-architecture
  - engineering-management
  - productivity
hero: assets/micro-feature-fallacy-hero.jpg
---

"Could we add a toggle for that?"

The request sounds harmless. Twenty lines, a checkbox, an afternoon at most. An agent can draft the patch before the discussion ends. Saying no now looks more expensive than saying yes.

Then the next request arrives. Different customer, different checkbox, same argument.

I call this the micro-feature fallacy: treating a small implementation as a small commitment. Each ticket shrinks. The system does not.

## The speed bump was doing two jobs

Build labor used to force a prioritization conversation. If an export option needed a week, it competed with the broken onboarding flow and the overdue migration. A niche convenience had to earn its place.

That friction was not a perfect product strategy. It also delayed valuable accessibility improvements and underserved workflows. I do not want expensive implementation back. I want to keep the decision that expensive implementation used to force.

AI compresses the time needed to produce plausible code for many bounded changes. It does not make delivered software zero-cost: review, security, deployment, migration, and support still have to happen. But once the draft is cheap, "we can build it quickly" becomes a persuasive answer to a different question: "should this behavior exist?"

In [Your sprint plans a bottleneck that left](https://www.likhansiddiquee.com/blog/sprint-planning-after-ai/), I argued for planning around the scarce work rather than the typing. Here is the product-side consequence: cheaper implementation is a reason to reconsider the admission rule, not to admit every request.

## Five small requests become one large promise

Imagine a reporting product with one export action. It downloads the filtered table as CSV, using stable column names, UTC timestamps, raw amounts, and visible rows. The behavior is boring enough to explain in one sentence.

Now consider five requests:

1. Use friendly column labels instead of stable names.
2. Export timestamps in the viewer's local timezone instead of UTC.
3. Format amounts for a spreadsheet instead of exporting raw numbers.
4. Include archived rows as well as visible rows.
5. Remember these choices for the next export.

Each can plausibly fit in a small patch. Together they change what "export" means.

An analyst wants friendly labels and spreadsheet formatting. An integration consumes stable names and raw numbers. A finance team needs archived rows for reconciliation. The timezone choice can move a timestamp across a date boundary. Remembered settings turn yesterday's choice into today's hidden input.

If all five switches are independent and binary, there are up to 32 configurations. That is a count of possible states, not a demand for 32 separate tests. Constraints, equivalence classes, pairwise coverage, and risk-based tests can reduce what needs exercising. They do not remove the need to decide which interactions matter.

For example, formatted numbers under one locale may contain commas that the CSV writer must quote. Friendly headers can break a script expecting stable names. A remembered local-time choice can surprise someone reconciling against UTC records. Whether those outcomes are valid behavior or defects depends on the contract, not the size of the patch.

The fifth option also adds a lifecycle question: where do preferences live, and what happens when defaults change? A browser setting, an account preference, and a saved export profile have different ownership and migration costs. "Remember my choice" is not only a checkbox.

Nobody approved a large redesign. Five people approved small additions.

## The twenty lines keep sending invoices

The implementation cost is visible on the ticket. The recurring costs are scattered across everyone else's work.

- **Cognitive cost:** users have to choose correctly, and engineers have to reconstruct what each combination means before changing it.
- **Context cost:** documentation, agent instructions, and retrieved code now contain more exceptions and legacy paths. Relevant constraints become harder to find and reconcile.
- **Compatibility and test cost:** later changes must preserve supported behavior, update fixtures, and exercise the interactions with meaningful failure risk.
- **Support cost:** "my export is wrong" now needs a settings snapshot, a locale, a timezone, and sometimes the history of a saved preference before anyone can reproduce it.

For an AI coding agent, extra branches and conflicting instructions can make reasoning harder, especially when the relevant contract is buried or omitted from the supplied context. That is a reason to keep constraints explicit and scoped. It is not evidence that adding toggles causes hallucinations, nor a claim that every larger codebase defeats an agent.

Humans have the same retrieval problem. A setting that serves three customers can occupy the attention of every engineer who later touches exports.

In [Architectural Debt is the New Technical Debt](https://www.likhansiddiquee.com/blog/architectural-debt-ai/), the local patch quietly created a second owner for a fact. Here, the patches can respect every service boundary and still create too many supported meanings for one action. Architectural discipline helps, but it cannot decide which product promises are worth keeping.

Feature density is not product clarity. A settings panel can grow while the answer to "what does this product do?" gets worse.

## Make the request pay its lifetime bill

I would put a short acceptance record in front of the coding prompt. Not a ceremony for every typo fix: a gate for new user-visible behavior, persistence, or configuration.

### 1. Name the workflow, not the requested switch

Write who needs the behavior, what they are trying to complete, how often they need it, and what fails today. Ask for a concrete artifact: a rejected import, a reconciliation mismatch, or a manual step they repeat.

"Add friendly headers" is a proposed solution. "Analysts rename twelve columns before sending a weekly report" is a workflow you can compare with other solutions.

### 2. Try to satisfy it without another independent choice

Consider a better default, a fixed output contract, a named profile, or a transformation outside the core product. Each alternative has costs too. A profile adds concepts; an external script adds maintenance and may be unusable for the people who need it.

In the export example, two named contracts might be clearer than five public switches: **Data export** with stable headers, UTC, and raw numbers; **Report export** with readable labels, a stated timezone, and presentation formatting. Archived-row access would still need an explicit rule consistent with authorization. Profiles are not permission bypasses.

This is a candidate design, not a universal cure. Users who need independent control may find profiles too restrictive. The point is to compare complete workflows before accepting the requested UI.

### 3. Map interactions and persistence before estimating the patch

List the supported states, forbidden combinations, defaults, stored values, and consumers that depend on the output. Name the high-risk interactions and how you will test them. Do not substitute a raw permutation count for a test strategy.

For exports, write down whether a header is a display label or a machine contract, whether a timezone is stored, and how old saved preferences behave after an upgrade. If that answer needs three teams, the feature is not small because the diff is.

### 4. Assign an owner and a review decision

Name who maintains the behavior, which evidence would justify keeping it, and when to review it. Depending on the workflow, evidence could include successful exports, fewer support incidents, or a critical customer requirement. Low usage alone does not make an accessibility or compliance feature disposable.

A feature flag can bound an experiment, but it adds another state, targeting rules, and a cleanup obligation. Give the flag an owner and a review date too.

Expiry means a decision is due, not that user behavior silently disappears. Keeping, consolidating, or removing the feature requires an explicit choice. Removal needs an owner, communication, and any necessary migration or deprecation window for saved settings and dependent consumers.

### 5. Approve the promise, not the line count

Approve only when the workflow benefit justifies the supported states and there is capacity to own them. If the benefit is weak, reject or defer it even when generation is cheap. If the benefit is substantial, accept the lifecycle work explicitly rather than pretending the toggle has none.

The acceptance record can be six lines: workflow, evidence, alternatives, supported contract, interaction tests, owner and review date. Its job is to make the recurring obligation visible before an agent makes the implementation look inevitable.

## A niche feature can still earn its place

Suppose the finance team's reconciliation depends on archived records. Refusing that behavior to keep the settings panel tidy would protect the interface at the expense of the job the product exists to do. It may deserve a supported export contract, permission checks, documentation, and tests.

Suppose another request changes header capitalization to save one person an occasional rename. It may belong in a local transformation, unless there is evidence that the same friction blocks a broader workflow.

The distinction is not popular versus niche. It is benefit versus continuing obligation. A rarely used feature can be essential; a frequently toggled setting can be evidence that the default is wrong.

My acceptance threshold for a new behavior would rise as implementation gets cheaper. Not because features became less valuable, but because build effort stopped screening out weak requests. Lower the cost of trying an idea. Keep a higher bar for turning it into a permanent promise.

An agent can draft the twentieth checkbox before you finish defending the nineteenth. The product still needs someone willing to ask whether either should exist.

For an export used by both analysts and automated integrations, would you offer independent settings, two named output contracts, or one stable export plus downstream transformations? Which compatibility constraint or user workflow would make you choose differently, and what migration would you owe existing users?
