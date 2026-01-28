# Pivnice U Tygra - AIAD-Powered Project Instructions

## Project Overview
**Pivnice U Tygra** is a comprehensive static website for a Czech pub in Brno, powered by the AIAD (AI-Augmented Development) ecosystem. This project demonstrates full-scale AIAD integration with intelligent agents, automated workflows, comprehensive documentation, and mycelial cross-domain learning capabilities.

**Business Context**: Modern pub website featuring live beer menu integration, responsive design, Czech localization, and comprehensive business information including private event booking and contact details.

## AIAD Ecosystem Integration

### Core AIAD Components
- **Version**: AIAD Standard Library v2.0.0
- **Ecosystem ID**: u-tygra-pivnice-brno
- **Domain**: Web Development (Hospitality/Restaurant)
- **Mycelial Networks**: Connected to Prismatic, OSINT, Nabla Infinity ecosystems

### Intelligent Agent Ecosystem (12+ Agents)

#### Content Management Agents
- **content-validator**: Validates content structure, links, and Czech localization
- **google-sheets-sync**: Manages live beer menu synchronization
- **seo-optimizer**: SEO analysis and optimization for Czech market
- **accessibility-checker**: WCAG 2.1 AA compliance validation

#### Development Workflow Agents
- **build-orchestrator**: Manages Zola build processes and optimization
- **deployment-manager**: Handles multi-environment deployments
- **quality-gate-sentinel**: Enforces comprehensive quality standards
- **performance-monitor**: Tracks Core Web Vitals and site performance

#### Documentation Agents
- **docs-analyzer**: Documentation completeness and consistency analysis
- **cross-reference-manager**: Manages internal linking and navigation
- **glossary-maintainer**: Maintains Czech/English terminology consistency
- **adr-assistant**: Assists with Architecture Decision Records

### Command Infrastructure (15+ Commands)

#### Content Operations
- `make content-analyze` - Comprehensive content analysis
- `make content-validate` - Link and consistency validation
- `make content-sync` - Google Sheets synchronization
- `make content-optimize` - SEO and performance optimization

#### Build & Deploy Operations
- `make build-dev` - Development build with live reload
- `make build-prod` - Production build with optimization
- `make deploy-staging` - Deploy to staging environment
- `make deploy-prod` - Deploy to production with quality gates

#### Quality & Maintenance Operations
- `make quality-check` - Run all quality gates
- `make docs-generate` - Auto-generate documentation
- `make health-report` - System health analysis
- `make backup-content` - Backup procedures

## Technology Stack

### Core Technologies
- **SSG**: Zola (Rust-based static site generator)
- **Template Engine**: Tera (Jinja2-like templating)
- **JS Framework**: Alpine.js 3.14.3 (reactive UI)
- **UI Components**: Flowbite 2.5.2 (Tailwind CSS component library)
- **Styling**: Tailwind CSS 3.x via CDN + Custom CSS
- **Fonts**: Google Fonts (Inter + Playfair Display)
- **Analytics**: Google Analytics 4

### Data Integration
- **Live Data**: Google Sheets CSV export (real-time beer menu)
- **Business Data**: Structured data in zola.toml
- **Content**: Markdown with rich front matter
- **Assets**: Co-located with content

### AIAD Technology Integration
- **Quality Gates**: HTML validation, accessibility, performance, SEO
- **Documentation**: Modular architecture with cross-referencing
- **Automation**: Make-based workflow with intelligent agents
- **Mycelial Integration**: Cross-domain pattern propagation

## Development Workflow

### Standard Commands
```bash
# Core Zola commands
zola build          # Build static site to public/
zola serve          # Dev server with hot reload (127.0.0.1:1111)
zola check          # Validate links and content structure

# AIAD-enhanced workflow
make dev            # Start development with AIAD monitoring
make build          # Production build with quality gates
make deploy         # Intelligent deployment with rollback safety
make test           # Comprehensive quality validation
make docs           # Auto-generate/update documentation
```

### Quality Gates Enforcement
All builds must pass:
- **HTML Validation**: W3C compliance
- **Accessibility**: WCAG 2.1 AA (95%+ score)
- **Performance**: Core Web Vitals (90%+ score)
- **SEO**: Schema.org compliance (95%+ score)
- **Link Validation**: All internal/external links functional
- **Security**: Content Security Policy compliance

## Project Structure (AIAD-Enhanced)

```
u-tygra/
├── content/                    # Zola content (Markdown)
│   └── _index.md              # Home page content
├── templates/                  # Tera templates
│   ├── base.html              # Base layout (101 lines)
│   ├── index.html             # Main page (563 lines)
│   └── shortcodes/            # Custom shortcodes
│       ├── note.html          # Info boxes
│       ├── warning.html       # Warning callouts
│       ├── adr.html           # ADR formatting
│       └── nav_breadcrumb.html # Navigation
├── static/                     # Static assets
│   ├── css/
│   │   └── style.css          # Custom styles (141 lines)
│   ├── js/
│   │   └── app.js             # Alpine.js app (177 lines)
│   └── img/                   # Images and media
├── sass/                       # Sass source (optional)
├── docs/                       # AIAD Documentation System
│   ├── core/                  # Essential knowledge
│   ├── guides/                # Task-oriented how-tos
│   ├── reference/             # Lookups and specifications
│   ├── operations/            # Deployment & maintenance
│   ├── architecture/          # Design decisions (ADRs)
│   └── _meta/                 # Documentation metadata
├── .aiad/                      # AIAD Ecosystem
│   ├── manifest.toml          # AIAD configuration
│   ├── agents/                # Intelligent agents (12+)
│   └── commands/              # Custom commands (15+)
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md              # This file
│   └── settings.local.json    # Permissions and context
├── .github/                    # CI/CD Integration
│   └── workflows/
│       └── aiad-integration.yml
├── Makefile                    # AIAD workflow automation
├── zola.toml                   # Zola configuration
└── README.md                   # Project overview
```

## Data Integration & Business Context

### Google Sheets Integration
- **Sheet ID**: 2PACX-1vSeZjP4HadboLuS8v4KVobNqsKtjaBpBJ8oCuPCC-OjfkCtCWA8N_asuxkedh7QSGhsrXU0JU_bV_Rn
- **Sheet GID**: 1804527038
- **Update Frequency**: Real-time via CSV export
- **Data Validation**: Automated via google-sheets-sync agent
- **Fallback**: Graceful error handling with loading states

### Business Information
- **Name**: Pivnice U Tygra
- **Address**: Vrchlického sad 1893/3, Brno, 602 00 CZ
- **Phone**: Bar: +420 776 140 840, Operations: +420 777 935 052
- **Hours**: Daily 16:00–24:00 (flexible by guests)
- **Company**: KONOVO s.r.o. (IČO: 17846927)
- **Bank**: Fio, a.s. (2902412257/2010)
- **Social**: Facebook @UTygraBrno

### Localization (Czech Focus)
- **Primary Language**: Czech (cs)
- **Secondary**: English (en)
- **Cultural Adaptation**: Czech business hours, address format, phone format
- **Currency**: Czech Koruna (CZK)
- **Legal**: Czech business entity information display

## Documentation System

### Modular Architecture (Following Prismatic Pattern)
The documentation follows a proven modular pattern for maintainable, AI-friendly documentation:

- **Atomic Files**: Single responsibility per document
- **Rich Cross-referencing**: Bidirectional linking system
- **Standardized Navigation**: Consistent breadcrumb and section navigation
- **Template-driven**: Shortcodes for consistent formatting
- **Version Control Friendly**: Granular changes, minimal merge conflicts

### Documentation Categories
1. **Core**: Essential architectural and business knowledge
2. **Guides**: Step-by-step task-oriented instructions
3. **Reference**: Lookup materials and specifications
4. **Operations**: Deployment, monitoring, maintenance procedures
5. **Architecture**: Decision records and system design
6. **Meta**: Documentation system maintenance and standards

## Quality Assurance

### Automated Quality Gates
- **HTML Validation**: W3C Markup Validator integration
- **Accessibility**: axe-core + WCAG 2.1 AA compliance
- **Performance**: Lighthouse + Core Web Vitals monitoring
- **SEO**: Schema.org + Open Graph validation
- **Security**: Content Security Policy enforcement
- **Links**: Internal/external link integrity checking

### Performance Targets
- **Lighthouse Performance**: ≥90
- **Lighthouse Accessibility**: ≥95
- **Lighthouse SEO**: ≥95
- **Core Web Vitals**: All metrics in "Good" range
- **Build Time**: <30 seconds including quality gates

## Deployment & Operations

### Multi-Environment Support
- **Development**: Local with live reload (`zola serve`)
- **Staging**: Preview environment for validation
- **Production**: Live website with full optimization

### Deployment Targets
- **Primary**: GitHub Pages (automated via Actions)
- **Alternative**: Netlify, Cloudflare Pages, AWS S3
- **Preview**: Automatic preview deployments for PRs

### Monitoring & Analytics
- **Analytics**: Google Analytics 4 (G-FTXJKHH6R0)
- **Performance**: Core Web Vitals tracking
- **Uptime**: Automated monitoring
- **Error Tracking**: Comprehensive error logging

## Mycelial Intelligence Integration

### Cross-Domain Connectivity
- **Prismatic**: Primary AIAD ecosystem connection
- **Pattern Sharing**: Bidirectional pattern propagation
- **Collective Learning**: Cross-project intelligence development
- **Evolution Tracking**: Continuous improvement through genetic operations

### Pattern Export/Import
- **Export**: Static site automation, Google Sheets integration, Czech localization
- **Import**: Documentation standards, quality gates, CI/CD workflows
- **Adaptation**: Intelligent pattern adaptation for Zola context

## Security & Compliance

### Security Measures
- **Content Security Policy**: Strict CSP headers
- **HTTPS**: Full HTTPS enforcement
- **Dependency Scanning**: Automated vulnerability assessment
- **Static Analysis**: Code quality and security validation

### Privacy & Compliance
- **GDPR**: Czech privacy law compliance
- **Data Processing**: Minimal personal data collection
- **Analytics**: Anonymized visitor tracking
- **Cookies**: Minimal cookie usage

## Developer Experience

### IDE Integration
- **VS Code**: Recommended with Zola extension
- **Claude Code**: Full integration with AIAD ecosystem
- **Live Reload**: Instant preview of changes
- **IntelliSense**: Template and content completion

### Debugging & Troubleshooting
- **Build Logs**: Comprehensive build output
- **Link Checker**: Automated link validation
- **Performance**: Built-in performance analysis
- **Error Pages**: Graceful error handling

### Contributing Guidelines
1. **Documentation First**: All changes require documentation updates
2. **Quality Gates**: All commits must pass quality validation
3. **Testing**: Comprehensive testing before deployment
4. **AIAD Integration**: Leverage intelligent agents for development tasks

---

**AIAD Classification**: SUPREME | **Authority**: EVOLUTIONARY | **Domain**: Hospitality + Web Development

*This project demonstrates the full power of AIAD (AI-Augmented Development) applied to static site development, featuring intelligent automation, comprehensive documentation, and mycelial cross-domain learning capabilities.*
