---
name: Generate Site Image
description: "Generate a mysite image prompt, negative prompt, and asset guidance for any site surface: blog banners, project hero images, in-post diagrams, page illustrations, social cards, or app UI artwork. Can also generate the image itself when an image tool is available."
agent: "Site Image Art Director"
argument-hint: "Target surface plus post path, project path, page/component, title, or brief; say prompt-only or generate image."
---

Create a high-quality image prompt for the provided target surface and source material.

Supported surfaces include:

- blog hero/banner
- project hero image
- in-post explanatory diagram
- page illustration
- social sharing card
- app UI artwork or empty-state illustration
- other `mysite` graphics

If the user provides a file path, read the content first and extract the core visual story from the
title, summary, opening section, and central argument. If the user provides selected text, a page or
component name, or a short brief, use that directly.

Default to a crisp editorial graphic unless the user asks for another medium:

- bold geometric shapes
- clear focal hierarchy
- readable at the intended size
- intentional negative space
- no fake text, no logos, no watermarks, no brand marks
- no generic AI robots unless the source material specifically requires one
- no glossy 3D render, stock-photo look, or murky cyberpunk lighting

Return this exact structure:

## Image Prompt

```text
{paste-ready image prompt}
```

## Negative Prompt

```text
{paste-ready negative prompt}
```

## Recommended Size

`{recommended dimensions and aspect ratio for the target surface}`

## Asset Note

Explain where the final image should live:

- Published content artwork: `content/assets/`, referenced from `content/index.json`,
  `content/projects.json`, or markdown with a content-relative path such as `assets/example.jpg`.
- App-owned decorative artwork: `app/public/` only when the user intentionally wants an app change
  and redeploy.

Do not modify app code, deploy paths, or content-loading boundaries just to add an image.

If the user explicitly asks to generate the image itself and an image-generation tool is available,
generate the image after producing the prompt, inspect the rendered result, and report the saved file
path. If no image-generation tool is available, explain that limitation briefly and stop after the
paste-ready prompt.
