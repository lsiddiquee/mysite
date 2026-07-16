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

- Publishing a new post is just committing a markdown file and adding one entry to
  `content/index.json` — **no rebuild, no redeploy**.
- The app itself only redeploys when I actually change the app code under `app/`.

## Code blocks work too

```ts
function greet(name: string): string {
  return `Hello, ${name}!`
}

console.log(greet('World'))
```

## What's next

More posts, and a few features for the site itself. Thanks for reading!
