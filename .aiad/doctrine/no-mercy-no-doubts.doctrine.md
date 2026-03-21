# NO MERCY, NO DOUBTS - U Tygra Execution Doctrine

**Version**: 1.0.0
**Status**: ABSOLUTE ENFORCEMENT
**Authority**: SUPREME COMMAND
**Last Updated**: 2026-03-21
**Classification**: L3 (Publicly Shareable)
**Origin**: Adapted from Prismatic Platform NMND v2.0.0

---

## Core Philosophy

**NO MERCY**: Execute with absolute precision. No half-measures. No excuses. No compromise on quality. Every task completed to perfection or not at all.

**NO DOUBTS**: Act with complete confidence. Make decisive choices. Trust the methodology. Eliminate hesitation. When uncertain, investigate first, then execute with full conviction.

---

## Philosophical Foundation

> *"Clovek dlouho veri, ze svet funguje na zaklade dobrych umyslu. Pak zacne stavet systemy. A zjisti, ze realita ma jednu neprijemnou vlastnost: nereaguje na omluvy."*

### Why This Doctrine Exists

A pub website is simple. That's exactly why it must be perfect. There are no excuses for:
- A broken beer menu
- A wrong phone number
- A 404 on the only page
- Stale prices
- Slow loading in a pub with bad Wi-Fi

Small projects tolerate zero defects because every defect is visible.

---

## The Doctrine (adapted for U Tygra)

### 1. EXECUTION WITHOUT MERCY

```yaml
rule: zero_tolerance_for_defects
enforcement: HARD
standards:
  html_validation: "zero errors"
  accessibility: "WCAG 2.1 AA minimum"
  lighthouse_performance: ">90"
  lighthouse_accessibility: ">95"
  lighthouse_seo: ">95"
  broken_links: "zero"
  javascript_errors: "zero in console"
  css_unused: "flagged and tracked"
  image_optimization: "all images optimized"
  loading_time: "<3 seconds on 3G"
```

### 2. EXECUTION WITHOUT DOUBTS

```yaml
rule: investigate_then_execute_fully
enforcement: HARD
workflow:
  1_investigate: "Read the code, understand the context"
  2_decide: "Choose the approach with full data"
  3_execute: "Implement completely, no stubs"
  4_verify: "Test, validate, confirm"
  5_ship: "Deploy with confidence"
prohibited:
  - TODO comments in production code
  - "Quick fix" without understanding root cause
  - Partial implementations
  - Untested changes
  - "It works on my machine" mentality
```

### 3. QUALITY GATES

```yaml
rule: all_gates_must_pass
enforcement: HARD
gates:
  - "make quality-check" passes
  - "zola check" passes
  - "make test-links" passes (when online)
  - No console errors in browser
  - Google Sheets data loads successfully
  - Kiosk mode renders correctly at 1920x1080
  - All images have alt text
  - Schema.org validates
```

---

## Enforcement

### Build-Time
- `zola check` with `internal_level = "error"`
- `make quality-check` as mandatory pre-deploy gate
- Link integrity testing via `make test-links`

### Pre-Commit
- `.githooks/pre-commit` runs validation
- No commits with TODO/FIXME in production templates

### Deployment
- Both GitHub Pages and GitLab Pages pipelines must succeed
- Failed pipeline = no deployment, no exceptions

---

## Mantras

- "Small project, zero excuses"
- "If it's broken in production, we failed"
- "Investigate first, then execute without hesitation"
- "The pub doesn't close for maintenance"
