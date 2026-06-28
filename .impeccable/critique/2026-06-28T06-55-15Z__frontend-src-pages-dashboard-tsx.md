---
target: dashboard
total_score: 34
p0_count: 0
p1_count: 0
timestamp: 2026-06-28T06-55-15Z
slug: frontend-src-pages-dashboard-tsx
---
# Critique: Dashboard (frontend/src/pages/Dashboard.tsx) — re-run after harden + layout + polish + colorize

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading skeleton, working 7D/30D toggle, error+retry all present; chart bars still show no numeric values (height + title tooltip only) |
| 2 | Match System / Real World | 4 | "Needs your review", "Up next", "All caught up" — natural, human, non-expert-friendly |
| 3 | User Control and Freedom | 3 | Retry on error, working range toggle, one-click Review; read-only-leaning otherwise (appropriate) |
| 4 | Consistency and Standards | 4 | Unified .btn-grad motion, tokenized colors, reused Card/PlatformTag/Icon; cohesive |
| 5 | Error Prevention | 3 | Mostly read-only surface; error state has recovery |
| 6 | Recognition Rather Than Recall | 4 | Surfaces what needs attention (review queue) and what's next instead of making users remember |
| 7 | Flexibility and Efficiency | 3 | Range toggle now works; still no keyboard shortcuts, bulk, filters, or drill-down |
| 8 | Aesthetic and Minimalist Design | 4 | Template + identical-card-grid gone; clear hierarchy, varied rhythm, on-brand |
| 9 | Error Recovery | 3 | Real error state + retry + friendly copy, but the message is generic (no specific diagnosis) |
| 10 | Help and Documentation | 3 | Empty states now teach the next step ("connect a platform, create your first post"); still no contextual tooltips |
| **Total** | | **34/40** | **Good — strong, shippable; remaining gaps are a11y depth + power-user efficiency** |

## Anti-Patterns Verdict

**LLM assessment:** Pass. The composition no longer reads AI-generated. The hero-metric template and the identical 4-card grid are gone, replaced by a review/up-next attention band leading the page and a one-prominent-metric + three-compact-stats strip. Color carries meaning (platform, status, review-amber); the gradient is accent-only; muted text is now legible. Rhythm varies section to section. A user fluent in dashboards would read this as deliberate, not templated.

**Deterministic scan:** detect.mjs → clean (exit 0, 0 findings). The previously-flagged color drift (#7c2bb0, #a59fbb) is fully resolved; the review-amber is documented in DESIGN.md.

**Visual overlays:** Not available — dashboard is behind ProtectedRoute (needs session + backend); this was a static-source + detector pass.

## Overall Impression
This went from a handsome display of fabricated data to a working home screen. It now opens with what a solo creator needs — what needs review, what's going out next — handles loading/empty/error honestly, and reads legibly. The single biggest remaining opportunity is **accessibility depth**: the performance chart is invisible to screen readers and the page has no semantic heading structure.

## What's Working
- **Leads with the work, not vanity metrics.** The "Needs your review | Up next" band is the first thing you see — the PRODUCT.md "user stays in control" principle made structural.
- **Honest about state.** Real skeleton loading, a teaching empty state, and an error+retry path — the async product's status is now first-class.
- **Legible and cohesive.** All muted text meets WCAG AA via documented tokens; button motion, color meaning, and primitives are consistent throughout.

## Priority Issues

- **[P2] Performance chart is invisible to screen readers.** Bars encode value by height + a `title` tooltip; no text values, no `aria-label`, no data table fallback.
  - Why it matters: Sam (SR user) gets nothing from the headline "performance" panel; the numbers exist only visually.
  - Fix: add an `aria-label` per bar (e.g. "Mon: 54%"), or a visually-hidden data table, or render the value on/under each bar.
  - Suggested command: $impeccable harden

- **[P2] No semantic heading structure.** Card titles and the topbar page title are styled `<div>`s, not `<h1>/<h2>/<h3>`.
  - Why it matters: screen-reader users navigate by heading; this page exposes none, so there's no skim structure.
  - Fix: promote the page title to `<h1>` and section/card titles to `<h2>` with the same styling.
  - Suggested command: $impeccable harden

- **[P2] No first-run activation flow.** The zero-data empty state exists, but the full path (connect FB/IG/TH → create first post → see it land) isn't designed.
  - Why it matters: the empty dashboard is the biggest activation moment for a brand-new solo creator.
  - Fix: design the guided first-run sequence beyond the single empty card.
  - Suggested command: $impeccable onboard

- **[P3] Touch targets below 44px.** Range toggle (~28px) and the Review button (~36px) on touch.
  - Why it matters: Casey (mobile) mis-taps; WCAG 2.5.5 advisory.
  - Fix: expand hit area to 44px via padding or a pseudo-element without growing the visual.
  - Suggested command: $impeccable adapt

## Persona Red Flags

**Alex (Power User):** The 7D/30D toggle works now — real progress. Still no keyboard shortcuts, no drill-down from a stat into detail, no filters or bulk actions. Efficient for a glance, thin for a power workflow.

**Sam (Accessibility):** Muted text now passes AA — the big win. Remaining: the performance chart conveys values visually only (no text/aria), and the page has no heading landmarks, so screen-reader navigation is flat. Focus states, aria-pressed toggle, role=status/alert, and table semantics are all good.

**Mai (Non-expert solo creator — project persona):** Now answered. The first thing she sees is "Needs your review" and "Up next" — concrete next actions, not vanity numbers. The empty state tells her exactly how to start. She still lacks a benchmark for whether 248.6K reach is good, but she's no longer lost.

## Minor Observations
- Error copy is generic ("something went wrong"); a specific cause would score higher on recovery.
- "Review" button navigates to Create rather than opening the post inline — acceptable, but the verb implies inline review.
- Chart bars still lack per-bar value labels even for sighted users; a hover tooltip or value caption would help.
- All trend pills remain positive (+); down/neutral variants still untested in context.

## Questions to Consider
- Should the performance chart expose its numbers (caption or hover) for everyone, which also solves the SR gap?
- Is a benchmark ("vs last period" / "good/avg/low") worth adding so the reach number means something to a first-timer?
- Does "Review" belong inline (approve/edit in place) rather than routing to Create?
