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

### Two audiences, and they do not mix

`SURFACE` and `STORY` are notes for whoever picks the file up later: the concept, the reasoning, the
rejected alternatives, and how this artwork stays distinct from its neighbours. `IMAGE PROMPT` and
`NEGATIVE PROMPT` are the only sections a generator ever sees. State that split inside every sidecar
so nobody pastes the notes into a model.

Keep `SURFACE` current rather than archival. Record where the content lives now, not where a draft
sat while the prompt was written.

### Never name a forbidden colour or motif in the positive prompt

A generator conditions on the tokens you give it, and negating words carry little weight. Writing
"deliberately avoid coral, cobalt, and vermilion" reliably makes coral, cobalt, and vermilion more
likely, not less. Sibling-artwork palettes are the usual offender, because the distinctness
requirement arrives as prose and gets written down as a list of colours.

Specify the palette exhaustively and close it instead:

```text
Use deep plum for the rig, chartreuse for every work unit, bone white for the streaks, ink black
for the rail and all outlines, cool steel grey for the retracted blocks. Every colour in the
picture comes from that list and nothing else.
```

A closed palette is a stronger constraint than an exclusion list, because it leaves nothing to fill.
Exclusions belong in `NEGATIVE PROMPT` and nowhere else. If the artwork must differ from an existing
image, explain that in `SURFACE` for the human and let the closed palette enforce it for the model.

### Order the negative prompt so it survives truncation

Most tools weight the earliest terms most and some silently drop the tail. Lead with the inversions
specific to this image, then motif and palette exclusions, then generic boilerplate
(`photorealistic`, `3D render`, `watermark`, `lens flare`) last. Losing boilerplate costs little;
losing an inversion cue costs the concept.

### State the load-bearing claim redundantly

A model will quietly correct an unusual composition into a sensible one. An instrument aimed at
nothing becomes an instrument inspecting the problem. A surface bulging outward comes back pinched
inward, which is what happened to the cognitive-tax hero's membrane on its first render.

For the one relationship that carries the concept, state it several independent ways in the positive
prompt (geometry, adjacency, an explicit negative statement, a physical simile), then repeat it in
the negative prompt. Do this for the thesis only. Applying it to every detail produces a prompt too
long to weight.

## Export Recipe

Renders arrive as oversized PNGs. This is the one command that turns any of them into a house-spec
hero. Do not re-derive it per post.

```bash
convert <source> -resize 1600x900 -colorspace sRGB -sampling-factor 4:4:4 -quality 90 -strip \
  content/assets/<slug>-hero.jpg

identify -format '%f  %wx%h  q=%Q  %b\n' content/assets/<slug>-hero.jpg
```

Target: JPEG, 16:9, 1600×900, sRGB, metadata stripped, roughly 150-260 KB. `-resize` preserves
aspect, so a 1.777 source lands on 1599×900; that rounding is fine and most existing heroes are
1599×900.

**Use 4:4:4, not the default.** ImageMagick defaults to 4:2:0 chroma subsampling, which is tuned for
photographs. Every image on this site is flat vector with hard black outlines and large saturated
flats, which is the exact case where 4:2:0 smears colour edges. The three oldest heroes shipped
4:2:0 by accident.

**Quality 90 is the default; deviate only on evidence.** If the output exceeds ~260 KB, step down to
88 then 85. If flat areas or outlines look blocky, step up to 92. When a step matters enough to
argue about, measure instead of guessing:

```bash
compare -metric RMSE candidate.jpg reference.png null:
```

Diminishing returns arrive fast. On the sprint-planning hero, q88/q92/q95 gave RMSE 0.0069 / 0.0058
/ 0.0051 at 133 / 180 / 284 KB, so 92 was the knee and 95 bought 11% fidelity for 58% more bytes.

**Then check the result**, because the extension can lie and a render can come back off-aspect.
Confirm dimensions, quality, and byte size, and confirm the filename matches both the manifest
`hero` field and the sidecar `ASSET TARGET`. Keep the oversized original in `.local/`, never in
`content/assets/`.

### What is actually in the repo

Settings drifted before this was written down, so do not copy an existing asset's encoding as
precedent:

| Asset | Quality | Chroma |
| --- | --- | --- |
| `your-copilot-is-waiting-hero.jpg` | 90 | 4:4:4 |
| `agentic-ai-cognitive-tax-hero.jpg` | 88 | 4:2:0 |
| `secured-deployment-hero.jpg` | 85 | 4:2:0 |
| `security-by-construction-hero.jpg` | 85 | 4:2:0 |
| `the-standalone-gateway-hero.jpg` | 85 | 4:2:0 |
| `sprint-planning-after-ai-hero.jpg` | 92 | 4:4:4 |

The app-owned banners under `app/public/` are 4:4:4 at quality 88 and run 314-402 KB, larger than
the content heroes because they render full-bleed. `site-banner.jpg` is 1672×941 rather than
1600×900. Leave them alone unless you are deliberately changing the deployed app.
