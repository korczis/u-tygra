# FLOWBITE FIRST - UI Component Doctrine

**Version**: 1.0.0
**Status**: MANDATORY
**Authority**: SUPREME COMMAND
**Last Updated**: 2026-03-21
**Classification**: L3 (Publicly Shareable)
**Integration**: NWB + NMND Doctrines

---

## Core Philosophy

**FLOWBITE FIRST**: Every UI component must use Flowbite's HTML/CSS patterns as the foundation. Alpine.js handles behavior, Flowbite provides structure and accessibility. No custom component markup when Flowbite has an equivalent.

---

## Philosophical Foundation

> *"Proc vymyslet kolo, kdyz Flowbite ma 50+ pristupnych, responzivnich komponent?"*

### Why This Doctrine Exists

The project currently loads Flowbite 2.5.2 (~136kB) but uses zero Flowbite components. This violates NWB ("adopt fully or not at all"). Either we use Flowbite as our design system or we remove it.

Decision: **USE IT**. Flowbite provides:
- Accessible components (ARIA attributes, keyboard navigation)
- Consistent dark mode patterns
- Responsive layouts tested across browsers
- LLM-friendly documentation (llms.txt standard)

---

## The Doctrine

### 1. COMPONENT HIERARCHY

```yaml
rule: flowbite_css_plus_alpine_behavior
enforcement: HARD
pattern:
  structure: "Flowbite HTML markup (semantic, accessible)"
  styling: "Flowbite + Tailwind utility classes"
  behavior: "Alpine.js x-data, x-show, x-on, x-for"
  NOT_used: "flowbite.min.js (redundant with Alpine)"
rationale: >
  Flowbite JS and Alpine.js both manage interactive state.
  Using both creates conflicts. Alpine is our runtime.
  Flowbite is our design system (CSS + HTML patterns only).
```

### 2. COMPONENT MAPPING

```yaml
rule: use_flowbite_equivalent_when_available
enforcement: HARD
mappings:
  navigation:
    component: "Flowbite Navbar"
    alpine: "x-data for mobile toggle, scroll state"
    features: [sticky, hamburger, active_state]
  beer_cards:
    component: "Flowbite Card"
    alpine: "x-for beer rendering, x-show for view toggle"
    features: [image, badges, hover_states]
  food_tabs:
    component: "Flowbite Tabs (underline variant)"
    alpine: "x-data for active tab state"
    features: [tab_switching, aria_roles]
  beer_styles:
    component: "Flowbite Badge/Pill"
    alpine: "x-on:click for filter toggle"
    features: [color_variants, rounded_full]
  announcements:
    component: "Flowbite Alert or Toast"
    alpine: "x-show for visibility, x-text for content"
    features: [dismissible, semantic_colors]
  gallery:
    component: "Flowbite Gallery + Modal"
    alpine: "x-data for lightbox state"
    features: [grid_layout, fullscreen_viewer]
  admin_forms:
    component: "Flowbite Forms"
    alpine: "x-model for data binding"
    features: [validation_styling, file_upload, toggles]
  notifications:
    component: "Flowbite Toast"
    alpine: "x-show with setTimeout auto-dismiss"
    features: [success, danger, warning, positioned]
```

### 3. ACCESSIBILITY REQUIREMENTS

```yaml
rule: flowbite_aria_patterns_mandatory
enforcement: HARD
requirements:
  - aria-expanded on all toggleable elements
  - aria-controls linking trigger to target
  - aria-selected on tab/pill selections
  - aria-current="page" on active nav item
  - aria-labelledby on modal dialogs
  - role="tablist/tab/tabpanel" on tabs
  - sr-only labels for icon-only buttons
  - focus:ring-4 on all interactive elements
  - tabindex management for modals
```

### 4. VERSION & LOADING

```yaml
rule: optimized_flowbite_loading
enforcement: HARD
version: "2.5.2" # Pinned, upgrade to 4.x when Tailwind v4 CDN stable
loading:
  css: "In <head>, not deferred (prevent FOUC)"
  js: "DO NOT LOAD (Alpine handles all interactivity)"
cdn: "https://cdn.jsdelivr.net/npm/flowbite@2.5.2"
```

### 5. LLM INTEGRATION

```yaml
rule: use_flowbite_llm_resources
enforcement: SOFT
resources:
  llms_txt: "https://raw.githubusercontent.com/themesberg/flowbite/main/llms.txt"
  llms_full: "https://raw.githubusercontent.com/themesberg/flowbite/main/llms-full.txt"
usage: >
  When generating UI code, reference Flowbite llms.txt for correct
  component markup. All AI-generated UI must use Flowbite patterns.
```

---

## Enforcement

### Pre-Commit Checks
- No custom modal/dropdown/tab markup when Flowbite equivalent exists
- All interactive elements have ARIA attributes
- No `flowbite.min.js` import (CSS only)

### Code Review
- New UI components must reference which Flowbite component they're based on
- Custom CSS only for project-specific effects (glass morphism, beer animations)
- Tailwind utilities preferred over custom CSS

---

## Mantras

- "Flowbite for structure, Alpine for behavior"
- "If Flowbite has it, use it"
- "No JS import — CSS patterns only"
- "Accessible by default, not by afterthought"
