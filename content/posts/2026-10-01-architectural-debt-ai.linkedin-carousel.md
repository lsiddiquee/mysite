---
marp: true
title: Architectural Debt is the New Technical Debt
description: Six slides on AI-assisted patches, payment status, and domain ownership.
theme: linkedin-portrait
paginate: true
footer: "likhansiddiquee.com | Architectural debt"
style: |
  :root {
    --ink: #202b2f;
    --paper: #f5f7f4;
    --cyan: #007e93;
    --red: #b83b34;
    --line: #bdc9c8;
  }

  section {
    box-sizing: border-box;
    padding: 104px 88px 108px;
    background: var(--paper);
    color: var(--ink);
    font-family: "Aptos", "Trebuchet MS", sans-serif;
    font-size: 40px;
    line-height: 1.24;
    letter-spacing: 0;
    overflow: hidden;
  }

  section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 26px;
    height: 100%;
    background: var(--cyan);
  }

  h2 {
    margin: 0 0 48px;
    max-width: 850px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 74px;
    line-height: 1.04;
    letter-spacing: 0;
  }

  p {
    margin: 28px 0 0;
  }

  strong {
    color: var(--red);
  }

  ul {
    margin: 38px 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    margin: 0;
    padding: 24px 0 26px 30px;
    border-left: 8px solid var(--cyan);
    font-size: 36px;
  }

  li + li {
    margin-top: 28px;
  }

  blockquote {
    margin: 50px 0 0;
    padding: 28px 36px;
    border-left: 12px solid var(--red);
    background: #e3eae7;
    font-size: 42px;
    font-weight: 700;
  }

  blockquote p {
    margin: 0;
  }

  code {
    color: var(--cyan);
    font-family: "Aptos Mono", "Courier New", monospace;
    font-size: 0.84em;
    font-weight: 700;
  }

  footer {
    left: 88px;
    right: 88px;
    bottom: 34px;
    color: var(--ink);
    font-size: 20px;
  }

  section.hook,
  section.close {
    background: var(--ink);
    color: var(--paper);
  }

  section.hook {
    padding-top: 160px;
  }

  section.hook h2,
  section.close h2 {
    color: var(--paper);
    font-size: 88px;
  }

  section.hook p,
  section.close p {
    color: var(--paper);
    font-size: 45px;
  }

  section.hook strong,
  section.close strong {
    color: #f08a79;
  }

  section.hook footer,
  section.close footer,
  section.hook::marp-pagination,
  section.close::marp-pagination {
    color: var(--paper);
  }

  section.example li:nth-child(2),
  section.failure li:nth-child(2) {
    border-color: var(--red);
  }

  section.contract li {
    border-color: var(--cyan);
  }
---

<!-- _class: hook -->
<!-- _paginate: false -->
<!-- _footer: "" -->

## Architectural debt is the new technical debt

AI makes a clean patch fast. It does not decide **who owns the fact** the patch changes.

---

<!-- _class: example -->

## A payment status on the order page

- The agent adds `paymentStatus` to the orders table.
- It copies a value from billing and updates the UI.
- Tests pass. The ticket closes.

Who owns the truth when a refund happens?

---

<!-- _class: failure -->

## Two statuses. One payment

- Billing records the refund.
- Orders still holds the earlier payment status.
- A shipping rule reads the orders copy.

Retries, out-of-order events, and partial failures turn a display shortcut into a consistency rule.

---

## Name the owner first

If billing owns payment status, the order page should read a **billing-owned view** or a defined projection.

If orders caches that projection, specify its source, updates, failure behavior, and acceptable staleness.

> Orders must not become a second authority.

---

<!-- _class: contract -->

## Change the agent's task

- Display billing's payment status on the order page.
- Do not add a writable payment field to orders.
- Define what the page shows when billing is unavailable.

A contract test can catch violations. It cannot choose the domain owner for you.

---

<!-- _class: close -->

## Faster code can accumulate debt faster

Local cleanup got cheaper. Cross-service ownership did not.

Before the next small patch, ask: **which part of the system is allowed to say this is true?**
