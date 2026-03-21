# Quality Gates Protocol - Pivnice U Tygra

## Pre-Commit Validation

Before every commit, validate:

1. **Zola Build**: `zola check` must pass (no broken internal links)
2. **Content**: Czech text properly encoded (UTF-8 with diacritics)
3. **Templates**: Valid HTML structure, no unclosed tags
4. **Assets**: CSS/JS files present and referenced correctly
5. **Configuration**: `zola.toml` valid TOML syntax

## Quality Commands

```bash
make quality-check    # Full quality gates
make test-links       # Link integrity (external + internal + data)
make full-check       # Complete: clean + analyze + quality + build + health
```

## Thresholds

- Lighthouse Performance: >= 90
- Lighthouse Accessibility: >= 95
- Lighthouse SEO: >= 95
- Internal links: 0 broken
- External links: warnings only (networks may be down)
