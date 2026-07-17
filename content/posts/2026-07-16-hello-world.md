---
title: Hello, World
date: 2026-07-16
summary: Why I built this site and how it works.
tags:
  - meta
---

Welcome to my new site. 👋

This is the first post, and it doubles as a quick note on how the site works.

## How publishing works

The site is a small **React + Vite** app hosted on GitHub Pages. The interesting part
is that **posts are not baked into the app**. Instead, the markdown for every post lives
in the `content/` folder of this same repository and is fetched at runtime.

That means:

- Publishing a new post is still just committing a markdown file and adding one entry to
  `content/index.json`.
- Content changes trigger a static Pages rebuild so social crawlers receive route-specific
  metadata, but post bodies remain runtime-fetched and are not bundled into the React app.

## Code blocks work too

```ts
function greet(name: string): string {
  return `Hello, ${name}!`
}

console.log(greet('World'))
```

## What's next

More posts, and a few features for the site itself. Thanks for reading!
