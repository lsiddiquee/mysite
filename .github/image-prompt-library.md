# Image Prompt Library

Reusable visual direction for `mysite` artwork. Concrete prompts belong beside their owning content
as `*.image-prompt.txt` sidecars; this file defines the shared grammar rather than a fixed palette.

## Shared Grammar

- Crisp editorial illustration with flat geometric forms and subtle print texture.
- One clear subject, one clear action, and one clear contrast at thumbnail size.
- Concrete objects and systems rather than generic symbols, AI robots, or decorative abstraction.
- Strong silhouettes, generous negative space, restrained detail, and no fake readable text.
- No logos, brand marks, watermarks, glossy 3D mockups, stock-photo staging, or murky lighting.
- Keep compositions legible in both light and dark site themes; the image itself does not need to
  reuse the site UI palette.

## Palette Strategy

Consistency comes from illustration language, not identical colors. Choose a palette that serves
the subject and clearly differs from nearby artwork:

- Engineering and systems can use electric cyan, safety yellow, vermilion, graphite, or steel.
- Writing and ideas can use paper white, editorial red, cobalt, ink black, or newsprint colors.
- Personal and exploratory work can use botanical green, Mediterranean blue, sunflower, coral, or
  other lively colors grounded by a dark structural tone.

Avoid repeating the same warm-stone, teal, coral, and mustard combination across every image.

## Article Banner Template

Read the full article and identify its central tension, not merely its technology keywords. Build a
single visual metaphor around that tension with one dominant subject and one visible action. Keep
the composition `16:9`, readable at card size, and free of text so the same artwork works in post
cards and social previews.

Store each article prompt beside its Markdown source:

```text
content/posts/<post-stem>.image-prompt.txt
content/projects/<project-stem>.image-prompt.txt
```

Store the final artwork under `content/assets/` and reference it through the matching manifest's
`hero` field. The sidecar is authoring material only: never add it to a manifest or fetch it from the
app.

## Sidecar Format

Use plain text with these labels:

```text
SURFACE:
STORY:
IMAGE PROMPT:
NEGATIVE PROMPT:
RECOMMENDED SIZE:
ASSET TARGET:
```

The format is intentionally not Markdown or YAML. It remains easy to paste into image tools and
cannot be mistaken for website content or frontmatter.
