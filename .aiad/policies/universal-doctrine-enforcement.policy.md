# Universal Doctrine Enforcement Policy

**Version**: 1.0.0
**Status**: MANDATORY
**Last Updated**: 2026-03-21
**Applies To**: All development, all agents, all deployments

---

## Doctrine Registry

| Acronym | Doctrine | File | Priority |
|---------|----------|------|----------|
| **NMND** | No Mercy, No Doubts | `no-mercy-no-doubts.doctrine.md` | CRITICAL |
| **NWB** | No Way Back | `no-way-back.doctrine.md` | CRITICAL |
| **GT** | Golden Tap | `golden-tap.doctrine.md` | CRITICAL |
| **KF** | Kiosk Fortress | `kiosk-fortress.doctrine.md` | HIGH |
| **CF** | Czech First | `czech-first.doctrine.md` | HIGH |
| **FF** | Flowbite First | `flowbite-first.doctrine.md` | HIGH |
| **AS** | Absorption Strategy | `absorption-strategy.doctrine.md` | MEDIUM |

---

## Enforcement Layers

### Layer 1: Pre-Commit (Automated)

`.githooks/pre-commit` validates:

1. **NMND Compliance**
   - No TODO/FIXME in production templates
   - No console.log in production JS (console.error allowed)
   - All images have alt text

2. **CF Compliance**
   - `lang="cs"` on HTML tag
   - No English-only user-facing strings in templates

3. **FF Compliance**
   - No `flowbite.min.js` import (CSS only)

### Layer 2: Build-Time (Zola + Make)

`make quality-check` validates:

1. **NMND**: `zola check` passes (zero errors)
2. **GT**: `make test-links-data` validates Google Sheets endpoint
3. **NMND**: Link integrity passes

### Layer 3: Deployment (CI/CD)

Both pipelines (GitHub + GitLab) must:

1. Build successfully with `zola build`
2. Pass all quality gates
3. No deployment on failure (zero exceptions)

### Layer 4: Agent Enforcement (AIAD)

All AIAD agents operate under:
- NMND: Execute fully or not at all
- NWB: Permanent solutions only
- CF: Czech-first for content operations
- GT: Data freshness validation

---

## Violation Response Protocol

| Level | Trigger | Response |
|-------|---------|----------|
| L1 | Pre-commit hook failure | Commit blocked, immediate fix required |
| L2 | Build failure | Deployment blocked, pipeline fails |
| L3 | Runtime data staleness | Visual indicator shown, alert logged |
| L4 | Multiple doctrine violations | Full review, root cause analysis |

---

## Quality Gate Integration

```yaml
gates:
  pre_commit:
    - nmnd_no_todos
    - cf_czech_lang
    - ff_no_flowbite_js
  build:
    - zola_check_passes
    - link_integrity
    - html_validation
  deploy:
    - both_pipelines_green
    - quality_check_passes
  runtime:
    - data_freshness_thresholds
    - kiosk_self_healing_active
    - error_boundary_catching
```
