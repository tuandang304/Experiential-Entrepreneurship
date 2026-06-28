---
target: dashboard
total_score: 26
p0_count: 0
p1_count: 2
timestamp: 2026-06-28T06-16-52Z
slug: frontend-src-pages-dashboard-tsx
---
# Critique: Dashboard (frontend/src/pages/Dashboard.tsx)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No loading/empty/error states; 7D/30D toggle is non-functional (dead control) |
| 2 | Match System / Real World | 3 | Friendly greeting + plain labels; good fit for non-expert users |
| 3 | User Control and Freedom | 3 | Read-only landing; limited but appropriate. Fake date toggle hurts |
| 4 | Consistency and Standards | 3 | Consistent card/pill/PlatformTag vocabulary; cohesive |
| 5 | Error Prevention | 3 | Mostly read-only; n/a-leaning |
| 6 | Recognition Rather Than Recall | 3 | Labeled stats and platforms; strong on this screen |
| 7 | Flexibility and Efficiency | 2 | No working date range, no filters, no keyboard shortcuts, no drill-down |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and on-brand, but composition is the generic SaaS dashboard reflex |
| 9 | Error Recovery | 2 | No error states at all; gap for a product whose principle is "honest about state" |
| 10 | Help and Documentation | 2 | No tooltips, no empty-state teaching, no first-run guidance |
| **Total** | | **26/40** | **Acceptable — polished surface, templated structure, missing states** |

## Anti-Patterns Verdict

**LLM assessment:** The page looks clean and on-brand, but the *composition* is the textbook SaaS-dashboard reflex: a drenched gradient hero with greeting + headline + CTA, a 4-up identical stat-card grid (icon tile + trend pill + big number + label), a chart-plus-breakdown two-column, and a recent-posts table. Two parent-skill anti-patterns are present at once — the **hero-metric template** and the **identical card grid**. The aurora gradient gives it ownership the generic clone lacks, but a viewer fluent in dashboards would guess the layout before scrolling. It's competent, not distinctive.

**Deterministic scan:** detect.mjs returned 3 advisory `design-system-color` findings (color drift vs DESIGN.md):
- `#7c2bb0` (line 22) — hero CTA text color, an undocumented one-off.
- `#a59fbb` (line 58) — chart bar labels.
- `#a59fbb` (line 96) — table header text.
The two `#a59fbb` hits land exactly on the **Legible Muted Rule** from DESIGN.md — the faintest gray used for text on white, almost certainly below 4.5:1. The detector caught the contrast risk the structure review flagged independently.

**Visual overlays:** Not available — dev server not running; this was a static-source + detector pass.

## Overall Impression
A handsome, on-brand dashboard that is currently a *display* of fabricated data rather than a *working* surface. The single biggest opportunity: make it earn its place as the home screen by (a) leading with the one thing a solo creator needs — what's going out next / what needs review — and (b) handling real state (loading, empty, error), which the product's own "honest about state" principle demands.

## What's Working
- **On-brand identity.** The radial-highlight gradient hero, PlatformTag chips, and status pills are consistent with the design system and feel owned, not stock.
- **Consistent component vocabulary.** Stat cards, trend pills, platform progress bars, and the table all reuse the same radii, colors, and PlatformTag primitive — cohesive screen to screen.
- **Right reading order for the audience.** Greeting → headline → reach/engagement → recent activity matches what a non-expert owner scans for.

## Priority Issues

- **[P1] Generic dashboard template.** Hero-metric block + four identical icon/number/label cards is the SaaS cliché; it reads "AI/template made this" despite the nice gradient.
  - Why it matters: the home screen is the product's first impression; sameness undercuts the "specific, owned" brand goal in PRODUCT.md.
  - Fix: differentiate hierarchy. Make the hero do real work (next scheduled post + a real action, or "3 posts need review"). Vary the stat presentation instead of four equal tiles; lead with the metric a creator acts on. Demote vanity numbers.
  - Suggested command: $impeccable layout (then $impeccable bolder)

- **[P1] Dead controls + no system status.** The 7D/30D switch does nothing, and every number is static mock with no loading, empty, or error state.
  - Why it matters: a fake toggle erodes trust; and a dashboard that can't render "loading…" or "no posts yet" violates the product's own "honest about state" principle the moment real data arrives.
  - Fix: wire the date toggle or remove it; add skeleton loading for cards/chart/table, a real empty state, and an error/retry state.
  - Suggested command: $impeccable harden

- **[P2] Muted-text contrast fails AA.** `#a59fbb` table headers + chart labels and `#8a85a0` stat labels/dates on white are below 4.5:1 — the Legible Muted Rule broken on the first screen.
  - Why it matters: WCAG 2.1 AA is the stated bar; column headers and the metric labels are exactly the text users must read.
  - Fix: bump body/label text to `#5b5670` or darker; reserve `#8a85a0`/`#a59fbb` for large or decorative text only.
  - Suggested command: $impeccable audit (then $impeccable colorize)

- **[P2] No first-run / empty state.** A brand-new user with zero connected accounts and zero posts still sees "248.6K reach" and a full table.
  - Why it matters: fabricated-looking numbers mislead and waste the biggest activation moment; a first-timer needs "connect an account → create your first post," not vanity stats.
  - Fix: design the zero-data dashboard — guide to connect FB/IG/TH and create the first post.
  - Suggested command: $impeccable onboard

- **[P3] Small craft tells.** `#7c2bb0` one-off CTA color (undocumented) and the "✨" emoji as button iconography brush against the "not childish/gimmicky" anti-reference.
  - Why it matters: minor, but accumulates against the credible-tool goal.
  - Fix: use a documented violet token; replace the emoji with a stroked Icon.
  - Suggested command: $impeccable polish

## Persona Red Flags

**Alex (Power User):** The 7D/30D toggle is fake — clicking 30D does nothing. No working date range, no filters, no drill-down from a stat into detail, no keyboard shortcuts. The only interaction that works is "View all" and the Create CTA. Reads as a demo, not a tool.

**Sam (Accessibility):** `#a59fbb` table headers and chart labels fail 4.5:1 on white. The bar chart encodes values by height + color only — no text values and no accessible labels, so a screen-reader user gets nothing from the "performance" chart. Trend deltas are fine (color + text), but the chart is meaning-by-visual-only.

**Mai (Non-expert solo creator — project persona):** Sees "248.6K reach" and "8.4% engagement" with no benchmark for whether that's good, and no answer to "what do I do next?" The hero CTA says "create new," but a first-timer likely hasn't connected an account yet. The dashboard displays performance instead of teaching the next step.

## Minor Observations
- All four stat trend pills are green "+"; no down/neutral state shown, so the component's other states are untested in context.
- Chart bars use `minHeight: 8` but have no value labels or hover tooltips — hard to read exact numbers.
- "View all" is a clickable `<span>` (not a button/link) — focus/keyboard affordance is weak.
- Hero CTA contrast (`#7c2bb0` text on white pill) is fine, but the pill sits on a gradient; verify focus-visible ring is present.

## Questions to Consider
- What if the dashboard led with "what's going out next" and "what needs your review" instead of vanity totals?
- Does a solo creator need four equal metrics, or one hero metric and a single trend?
- What would the dashboard look like with zero data — and is that the screen most new users actually see first?
