# ABSORPTION STRATEGY - Technology Integration Doctrine

**Version**: 1.0.0
**Status**: MANDATORY
**Authority**: SUPREME COMMAND
**Last Updated**: 2026-03-21
**Classification**: L3 (Publicly Shareable)
**Origin**: Adapted from Prismatic Platform Absorption Strategy

---

## Core Philosophy

**ABSORB > ADAPT > WRAP**: Prefer native integration over wrappers. Use CDN libraries directly via their documented APIs. Never add abstraction layers over simple tools.

---

## Why This Doctrine Exists

A static site with Alpine.js and Tailwind CSS does not need:
- A build system (Zola handles it)
- A package manager (CDN handles dependencies)
- An abstraction layer over Google Sheets
- A state management library (Alpine.js IS the state)
- A routing library (single page, hash navigation)

Every added dependency is a maintenance burden. Every abstraction is a place for bugs to hide.

---

## The Doctrine

### 1. TECHNOLOGY STACK (LOCKED)

```yaml
rule: minimal_dependency_stack
enforcement: HARD
locked_stack:
  ssg: "Zola (Rust) — builds HTML, no runtime"
  ui_framework: "Alpine.js via CDN — reactive UI"
  css: "Tailwind CSS via CDN — utility-first styling"
  components: "Flowbite CSS via CDN — component patterns"
  data: "Google Sheets CSV export — live beer data"
  analytics: "GA4 via gtag.js — tracking"
  maps: "Google Maps iframe — no JS API needed"
  storage: "Firebase (free tier) — photos, events, admin auth"
  hosting: "GitHub Pages + GitLab Pages — dual deployment"
prohibited:
  - npm/yarn/pnpm (no Node.js)
  - React/Vue/Svelte (Alpine is enough)
  - Bootstrap/Material UI (Flowbite + Tailwind is enough)
  - jQuery (Alpine + vanilla JS is enough)
  - Custom backend server (static + Firebase)
```

### 2. ABSORPTION PRIORITY

```yaml
rule: absorb_not_wrap
enforcement: HARD
priority:
  1_absorb: "Use library APIs directly, no wrapper classes"
  2_adapt: "Modify patterns to fit project context"
  3_wrap: "Last resort, only for external service abstraction"
examples:
  good:
    - "Alpine.js x-data directly in HTML (absorbed)"
    - "Tailwind utilities directly on elements (absorbed)"
    - "fetch() for Google Sheets CSV (native API)"
    - "Firebase JS SDK direct calls (absorbed)"
  bad:
    - "BeerDataService class wrapping fetch() (unnecessary wrap)"
    - "TailwindHelper utility functions (wrap over absorbed)"
    - "AlpineStateManager abstraction (wrap over absorbed)"
```

### 3. CDN MANAGEMENT

```yaml
rule: pinned_versions_no_local_copies
enforcement: HARD
rules:
  - Pin exact versions in CDN URLs (e.g., @3.14.3)
  - Never download and self-host CDN libraries
  - Document version in .aiad/manifest.toml
  - Test before upgrading versions
  - Service Worker caches CDN resources for offline use
```

---

## Mantras

- "If CDN has it, use CDN"
- "No npm install in a Zola project"
- "The best abstraction is no abstraction"
