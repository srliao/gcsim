# gcsim ui-next — Design System

The shared visual language for `ui-next`. Every component, every screen draws from this document.

**Status:** v0.1 — first cut. Update this file when you change a token; don't leave drift between code and docs.

---

## 01 · Brand

gcsim's identity is anchored to its mascot — a blue researcher hamster with swirly glasses, a clipboard, and a quill. The mascot stays as-is. The system around it is intentionally restrained so the mascot is the visual signature.

### Wordmark
`gcsim`, set in Geist Semibold, tight-tracked. Always rendered as text — never an SVG wordmark. Casing is lowercase.

### Mascot asset
`/assets/gcsim-logo.png` (567×460 PNG, transparent). Use at native ratio. Drop a soft accent-blue glow behind it via:

```css
filter: drop-shadow(0 14px 32px var(--accent-glow));
```

### Brand palette

Four anchors, all derived from the mascot's blues:

| Token              | OKLCH                       | Hex     | Use                                                                |
| ------------------ | --------------------------- | ------- | ------------------------------------------------------------------ |
| `--accent`         | `oklch(0.67 0.14 252)`      | ~#4A8FD8 | Primary CTAs, focus rings, brand mark, the WASM-ready pulse        |
| `--accent-deep`    | `oklch(0.48 0.13 254)`      | #005090  | Logo's body blue. Use on light surfaces — print, share embeds      |
| `--brand-blue-2`   | `oklch(0.55 0.07 250)`      | #407090  | Mascot mid-tone. Illustration only — not a UI accent               |
| `--brand-blue-3`   | `oklch(0.25 0.08 255)`      | #002040  | Outline navy. Not used in chrome                                   |
| `--brand-slate`    | `oklch(0.62 0.02 270)`      | #9090A0  | Glasses grey. Tertiary type / dim states on light surfaces         |

The accent is a brightened derivation of the mascot's body blue, lifted to OKLCH L≈0.67 so it carries on dark graphite chrome.

---

## 02 · Principles

| #   | Principle                              | Detail                                                                                                                |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 01  | **Chrome is neutral**                  | Page, cards, borders, type — all warm graphite (hue 250, chroma ≤0.015). Element color never appears in chrome.       |
| 02  | **Element colors are a data language** | The 7 element hues + physical are reserved for character contexts, charts, and damage attribution.                    |
| 03  | **Numbers are mono**                   | Every stat readout uses JetBrains Mono with tabular figures. DPS columns line up vertically.                          |
| 04  | **Borders before fills**               | Cards are outlined on the page; saturated fills are reserved for primary, status, and elements.                       |
| 05  | **One radius rhythm**                  | sm 4 · md 6 · lg 8 · xl 12 · 2xl 16. Pill for chips. Buttons use md; cards use xl.                                    |
| 06  | **Density matches the work**           | Sim users live in this for hours. Tight rows, 13px body, 11px labels. Pro-tool density.                               |
| 07  | **Dark-first, no light mode**          | The sim is used in long sessions, often at night. No light variant ships — every component assumes dark surface.      |
| 08  | **Element = background, not badge**    | A character's element is communicated by a tinted starry texture in the background, never by an element-glyph badge.  |

---

## 03 · Tokens

All token names are CSS custom properties. Declare in `:root`. Every component must read tokens — no inline hex codes.

### Type

```css
--font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

/* scale — modular, tight */
--text-2xs:    10px;
--text-xs:     11px;
--text-sm:     12px;
--text-base:   13px;   /* body default */
--text-md:     14px;
--text-lg:     16px;
--text-xl:     20px;
--text-2xl:    26px;
--text-3xl:    34px;
--text-4xl:    44px;
--text-display:56px;

--leading-tight:  1.15;
--leading-snug:   1.30;
--leading-normal: 1.50;

--tracking-tight: -0.02em;
--tracking-flat:   0em;
--tracking-wide:   0.08em;
```

**Usage roles:**

| Role    | Class       | Size | Weight | Tracking |
| ------- | ----------- | ---- | ------ | -------- |
| display | `t-display` | 56   | 600    | -0.02em  |
| h1      | `t-h1`      | 34   | 600    | -0.02em  |
| h2      | `t-h2`      | 26   | 600    | -0.02em  |
| h3      | `t-h3`      | 20   | 600    | -0.02em  |
| body    | (default)   | 13   | 400    | 0        |
| sm      | `t-sm`      | 12   | 400    | 0        |
| xs      | `t-xs`      | 11   | 400    | 0        |
| eyebrow | `t-eyebrow` | 10   | 500    | 0.08em UPPERCASE |

**Mono use:** all numbers (DPS, percentages, durations, frame counts, levels, refines, consts). Add `font-variant-numeric: tabular-nums` so columns align. Tag with `.mono.tnum`.

**Loading:** Geist + JetBrains Mono via Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

### Spacing (4px base)

```css
--sp-0:  0;
--sp-1:  4px;
--sp-2:  8px;
--sp-3: 12px;
--sp-4: 16px;
--sp-5: 20px;
--sp-6: 24px;
--sp-8: 32px;
--sp-10:40px;
--sp-12:48px;
--sp-16:64px;
```

### Radius

```css
--radius-sm:   4px;
--radius-md:   6px;
--radius-lg:   8px;
--radius-xl:  12px;
--radius-2xl: 16px;
--radius-pill: 999px;
```

Buttons → md. Inputs → md. Cards → xl. Chips → pill. Mascot frames → 2xl.

### Chrome (dark-first, warm graphite, hue 250)

```css
--bg-0:    oklch(0.155 0.012 250);  /* deepest — page          */
--bg-1:    oklch(0.195 0.012 250);  /* card resting            */
--bg-2:    oklch(0.235 0.012 250);  /* raised / popover        */
--bg-3:    oklch(0.285 0.012 250);  /* input filled            */
--bg-overlay: oklch(0.13 0.012 250 / 0.72);

--line-1:  oklch(1 0 0 / 0.06);     /* hairline                */
--line-2:  oklch(1 0 0 / 0.10);     /* card border             */
--line-3:  oklch(1 0 0 / 0.16);     /* hover / focus border    */

--fg-0:    oklch(0.985 0.005 250);  /* primary text            */
--fg-1:    oklch(0.78  0.008 250);  /* secondary               */
--fg-2:    oklch(0.58  0.008 250);  /* tertiary / labels       */
--fg-3:    oklch(0.42  0.008 250);  /* disabled / dim          */
```

### Brand accent

```css
--accent:        oklch(0.67 0.14 252);
--accent-hover:  oklch(0.74 0.14 252);
--accent-deep:   oklch(0.48 0.13 254);
--accent-fg:     oklch(0.16 0.05 254);
--accent-soft:   oklch(0.67 0.14 252 / 0.16);
--accent-line:   oklch(0.67 0.14 252 / 0.40);
--accent-glow:   oklch(0.67 0.14 252 / 0.45);
```

### Status semantics

```css
--ok:        oklch(0.78 0.16 145);
--ok-soft:   oklch(0.78 0.16 145 / 0.16);
--warn:      oklch(0.82 0.14  75);
--warn-soft: oklch(0.82 0.14  75 / 0.16);
--error:     oklch(0.70 0.20  25);
--error-soft:oklch(0.70 0.20  25 / 0.16);
--info:      oklch(0.78 0.12 250);
--info-soft: oklch(0.78 0.12 250 / 0.16);
```

### Element palette (re-tuned)

The original ui's hex element palette ranged from L=0.50 (Hydro `#2F63D4`) to L=0.86 (Anemo `#61DBBB`) — on a stacked chart, Hydro disappears and Anemo dominates. The retuned set sits at parity (L≈0.78, C≈0.14):

```css
--el-anemo:    oklch(0.82 0.135 165);
--el-geo:      oklch(0.82 0.135  75);
--el-electro:  oklch(0.72 0.165 320);
--el-hydro:    oklch(0.68 0.165 245);
--el-pyro:     oklch(0.70 0.180  25);
--el-cryo:     oklch(0.82 0.110 235);
--el-dendro:   oklch(0.84 0.180 130);
--el-physical: oklch(0.85 0.005   0);

--el-anemo-soft:    oklch(0.82 0.135 165 / 0.16);
--el-geo-soft:      oklch(0.82 0.135  75 / 0.16);
--el-electro-soft:  oklch(0.72 0.165 320 / 0.16);
--el-hydro-soft:    oklch(0.68 0.165 245 / 0.16);
--el-pyro-soft:     oklch(0.70 0.180  25 / 0.16);
--el-cryo-soft:     oklch(0.82 0.110 235 / 0.16);
--el-dendro-soft:   oklch(0.84 0.180 130 / 0.16);
--el-physical-soft: oklch(0.85 0.005   0 / 0.12);
```

**Element mapping for viewer rollup tiles** (data → tone):

| Metric | Tone |
|--------|------|
| DPS | `pyro` |
| EPS | `cryo` |
| RPS | `electro` |
| HPS | `anemo` |
| SHP | `geo` |
| Duration | `dendro` |

These are visual associations only — the data isn't actually pyro damage. The colours just give each metric a memorable identity.

### Shadows + glow

```css
--shadow-1: 0 1px 0 0 oklch(1 0 0 / 0.04) inset;
--shadow-2: 0 8px 24px -10px oklch(0 0 0 / 0.6);
--glow-accent: 0 0 0 1px var(--accent-line), 0 0 22px -2px var(--accent-glow);
```

### Motion

```css
--ease-out:    cubic-bezier(0.2, 0.7, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.4, 0.4, 1);
--dur-fast: 120ms;
--dur-base: 200ms;
--dur-slow: 380ms;
```

| Duration | Use                                          |
| -------- | -------------------------------------------- |
| 120ms    | Hover, focus, colour                         |
| 200ms    | Reveals, transitions                         |
| 380ms    | Layout, large surfaces                       |
| 380ms + spring | Affirmative actions (run start, success) |

Honour `prefers-reduced-motion`. Disable mascot pulse, slide-ins, scrubber autoplay.

### Z-index

```css
--z-dropdown: 50;
--z-sticky:  100;
--z-modal:   200;
--z-popover: 300;
--z-tooltip: 400;
```

---

## 04 · Surfaces

The system has four surface tiers. Stack them deliberately — don't mix.

| Tier      | Token        | Use                                                       |
| --------- | ------------ | --------------------------------------------------------- |
| Page      | `var(--bg-0)`| Body background                                           |
| Card      | `var(--bg-1)`| Cards, rollup tiles, character cards, editor panel        |
| Raised    | `var(--bg-2)`| Popovers, dropdown menus, tab backgrounds, footer chrome  |
| Input     | `var(--bg-3)`| Filled inputs, selects, button-secondary background       |

Borders separate tiers. Use `--line-1` for internal dividers, `--line-2` for card outlines, `--line-3` for hover / focus.

---

## 05 · Mascot in the system

The mascot is a brand asset, not a UI component. Three approved uses:

1. **Nav** — 32×32 `<img>` left of the wordmark. No glow.
2. **Foundations splash** — 180×180 with the accent-glow pulse animation behind.
3. **Empty states** — 96–120px centered above the empty-state message with a soft accent glow.

Don't crop, recolor, or re-illustrate the mascot. If a new variant is needed (e.g. error state), commission it — don't generate one.

---

## 06 · Element textures

A character's element is communicated by tinted **background texture**, never by a glyph badge.

The texture is `/assets/misc/overlay.jpg` — a 1930×610 starry / cosmic JPEG sourced from `genshinsim/assets`. Apply tinted via:

```css
background:
  /* element wash */
  radial-gradient(120% 110% at 90% 110%,
    color-mix(in oklch, var(--el-c) 80%, transparent) 0%,
    color-mix(in oklch, var(--el-c) 40%, transparent) 35%,
    transparent 80%),
  /* starry overlay, screen-blended */
  url("/assets/misc/overlay.jpg") center / cover no-repeat,
  /* base tinted graphite */
  color-mix(in oklch, var(--el-c) 18%, var(--bg-2));
background-blend-mode: normal, screen, normal;
```

Set `--el-c` on the host element via `data-element="<element>"`. The Portrait and CharacterCard components do this automatically.

For light-on-dark legibility, overlay a top-left vignette where text sits:

```css
&::after {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(120% 80% at 0% 0%, oklch(0 0 0 / 0.55), transparent 60%),
    linear-gradient(180deg, oklch(0 0 0 / 0.18) 0%, transparent 30%);
}
```

---

## 07 · Iconography

- **Element glyphs** — single letters in the new `ElementGlyph` component. Render only as a fallback when a real asset isn't available. **Do not use as a visual identifier for elements in cards** — see Principle 08.
- **UI icons** — Lucide (`lucide-react@0.577.0`, already in `package.json`). 16px in compact contexts, 18px in primary buttons, 14px in inline badges.
- **Character / weapon / artifact icons** — real assets only. Sourced from `genshinsim/assets` and mirrored into `apps/web/public/assets/`. Never stylize or invent.

---

## 08 · Numbers

Mandatory mono + tabular for every numeric readout:

```html
<span class="mono tnum">104,147</span>
```

Format conventions:

| Quantity         | Format                            |
| ---------------- | --------------------------------- |
| DPS, total dmg   | `104,147` (US thousands, no unit) |
| Per-second rates | `10.34`, `2.28` (2 decimals)      |
| Duration         | `109.07s`                         |
| Percentage       | `73.2%`                           |
| Frame counts     | `12f`                             |
| Confidence       | `μ 32.1k · σ 2.1k`                |
| Refine / cons    | `R1`, `C0` — no leading zero pad   |

---

## 09 · Open decisions

- **Light mode?** No. Don't ship one. (See Principle 07.)
- **Custom mascot variants?** Commission, don't generate.
- **Brand wordmark?** Lowercase text-based. Don't ship an SVG wordmark.
- **Translation?** All strings ship through `i18next` (already in deps). Numbers stay locale-formatted via `Intl.NumberFormat`.

---

## Changelog

- **v0.1** — Initial cut. Dark-first, mascot-anchored brand. Element-texture pattern committed. OKLCH retuning of the original hex element palette.
