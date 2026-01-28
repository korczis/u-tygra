+++
title = "Architecture Overview"
description = "Comprehensive overview of U Tygra AIAD-powered architecture"
weight = 1
+++

# Architecture Overview

Comprehensive overview of the **Pivnice U Tygra** AIAD-powered static site architecture.

<!-- NAV_START -->
## Navigation

**Current Location**: [Documentation](../) > [Core](../) > 🏗️ Architecture Overview

### Quick Links
- **📚 [Documentation Home](../../)**
- **📋 [Core Home](../)**
- **🏠 [Main Website](/)**

### Related Documents
- **[Technology Stack](tech-stack.md)** - Detailed technology choices
- **[Project Structure](project-structure.md)** - File organization
- **[ADR-0001](../architecture/adr-0001-aiad-integration.md)** - AIAD integration decision
<!-- NAV_END -->

## System Overview

The U Tygra project implements a **comprehensive AIAD-powered static site architecture** designed for:
- **Performance**: Lightning-fast static delivery with CDN optimization
- **Intelligence**: AI-augmented development with automated quality gates
- **Scalability**: Modular design supporting future enhancements
- **Maintainability**: Clear separation of concerns and comprehensive documentation

## Architectural Layers

### 1. **Presentation Layer**
```
┌─────────────────────────────────────────┐
│             Browser (Client)            │
├─────────────────┬───────────────────────┤
│   Alpine.js     │    Tailwind CSS       │
│   (Reactive)    │    + Flowbite         │
│                 │    (Styling)          │
└─────────────────┴───────────────────────┘
```

**Components**:
- **Alpine.js 3.14.3**: Lightweight reactive framework for interactivity
- **Tailwind CSS 3.x**: Utility-first CSS framework via CDN
- **Flowbite 2.5.2**: Pre-built component library
- **Custom CSS**: Brand-specific styling and animations

**Responsibilities**:
- User interface rendering and interaction
- Live data fetching from Google Sheets CSV
- Responsive design and accessibility
- Client-side state management

### 2. **Build Layer**
```
┌─────────────────────────────────────────┐
│              Zola Builder               │
├─────────────────┬───────────────────────┤
│   Content       │    Templates          │
│   (Markdown)    │    (Tera Engine)      │
│                 │                       │
└─────────────────┴───────────────────────┘
```

**Components**:
- **Zola**: Rust-based static site generator
- **Tera**: Template engine (Jinja2-like syntax)
- **Markdown**: Content authoring with rich front matter
- **Sass**: CSS preprocessing (optional)

**Responsibilities**:
- Static HTML generation from templates and content
- Asset processing and optimization
- Site structure and navigation generation
- SEO metadata and schema generation

### 3. **Data Layer**
```
┌─────────────────────────────────────────┐
│             Data Sources                │
├─────────────────┬───────────────────────┤
│  Google Sheets  │    Static Content     │
│  (Live Beer)    │    (Business Info)    │
│                 │                       │
└─────────────────┴───────────────────────┘
```

**Components**:
- **Google Sheets**: Live beer menu data via CSV export
- **TOML Configuration**: Business metadata in zola.toml
- **Markdown Front Matter**: Page-specific metadata
- **JSON Data**: Structured content for templates

**Responsibilities**:
- Real-time beer menu synchronization
- Business information management
- Content metadata and taxonomy
- Localization data (Czech/English)

### 4. **AIAD Intelligence Layer**
```
┌─────────────────────────────────────────┐
│           AIAD Ecosystem                │
├─────────────────┬───────────────────────┤
│   Agents (12+)  │    Commands (15+)     │
│   (Automation)  │    (Workflows)        │
│                 │                       │
└─────────────────┴───────────────────────┘
```

**Components**:
- **Intelligent Agents**: Specialized automation for content, development, documentation
- **Command Infrastructure**: Standardized workflows and quality gates
- **Quality Gates**: Comprehensive validation pipeline
- **Mycelial Networks**: Cross-domain learning and pattern propagation

**Responsibilities**:
- Automated quality assurance and testing
- Intelligent deployment and rollback management
- Documentation generation and maintenance
- Cross-project pattern sharing and learning

## Data Flow Architecture

### 1. **Content Update Flow**
```
Content Update → Zola Build → Quality Gates → Deploy → CDN
      ↓              ↓            ↓          ↓       ↓
  AIAD Agents → Validation → Testing → Staging → Production
```

### 2. **Live Data Flow**
```
Google Sheets → CSV Export → Client Fetch → Alpine.js → DOM Update
      ↓              ↓            ↓           ↓          ↓
  Business User → Real-time → Browser → Reactive → UI Refresh
```

### 3. **Development Flow**
```
Code Change → AIAD Analysis → Quality Gates → Build Test → Deploy
     ↓             ↓              ↓            ↓          ↓
 Developer → AI Validation → Automation → Verification → Live Site
```

## Component Integration

### **Frontend Integration**
- **Alpine.js ↔ Google Sheets**: Live data fetching and error handling
- **Tailwind ↔ Flowbite**: Utility classes with pre-built components
- **Custom CSS ↔ Brand**: Tiger theme and beer-specific styling

### **Build Integration**
- **Zola ↔ AIAD**: Intelligent build processes with quality validation
- **Templates ↔ Content**: Dynamic content rendering with metadata
- **Assets ↔ Optimization**: Automated asset processing and compression

### **AIAD Integration**
- **Agents ↔ Workflows**: Intelligent automation throughout development lifecycle
- **Quality Gates ↔ Deployment**: Zero-regression deployment with rollback safety
- **Mycelial ↔ Ecosystem**: Cross-domain learning and pattern propagation

## Performance Architecture

### **Build Performance**
- **Target**: <30 seconds for full build including quality gates
- **Optimization**: Rust-based Zola for maximum build speed
- **Caching**: Intelligent asset caching and incremental optimization

### **Runtime Performance**
- **Core Web Vitals**: All metrics in "Good" range
- **Lighthouse Score**: >90 Performance, >95 Accessibility, >95 SEO
- **Bundle Size**: Minimal JavaScript footprint via CDN delivery

### **Deployment Performance**
- **Static Delivery**: Pure static files for maximum CDN efficiency
- **Zero Downtime**: Atomic deployments with instant rollback capability
- **Global Distribution**: CDN-optimized for worldwide accessibility

## Security Architecture

### **Content Security**
- **Content Security Policy**: Strict CSP headers for XSS prevention
- **Static Generation**: No server-side vulnerabilities
- **Dependency Scanning**: Automated vulnerability assessment

### **Data Security**
- **Public Data Only**: No sensitive business data exposed
- **HTTPS Enforcement**: Full HTTPS with secure headers
- **Privacy Compliance**: GDPR-compliant minimal data collection

### **Build Security**
- **Immutable Builds**: Each build creates immutable artifact
- **Source Control**: All changes tracked in version control
- **Access Control**: Restricted deployment permissions

## Scalability Architecture

### **Content Scalability**
- **Modular Structure**: Easy addition of new sections and pages
- **Taxonomy System**: Flexible categorization and tagging
- **Multilingual Support**: Built-in Czech/English localization

### **Feature Scalability**
- **Component Library**: Reusable Flowbite components
- **Shortcode System**: Custom content blocks via Zola shortcodes
- **AIAD Extensibility**: Additional agents and commands as needed

### **Infrastructure Scalability**
- **Static Delivery**: Inherently scalable via CDN
- **Multiple Deployment Targets**: GitHub Pages, Netlify, Cloudflare
- **Environment Flexibility**: Development, staging, production support

## Monitoring & Observability

### **Performance Monitoring**
- **Core Web Vitals**: Real-time performance tracking
- **Google Analytics 4**: Visitor behavior and site usage
- **Lighthouse CI**: Automated performance testing

### **Quality Monitoring**
- **AIAD Quality Gates**: Continuous quality validation
- **Link Checking**: Automated link integrity verification
- **Accessibility Monitoring**: WCAG 2.1 AA compliance tracking

### **Business Monitoring**
- **Beer Menu Updates**: Live data synchronization monitoring
- **Contact Form**: Business inquiry tracking
- **Social Media Integration**: Facebook engagement monitoring

---

**Related Documentation**:
- [Technology Stack](tech-stack.md) - Detailed technology choices and rationale
- [Project Structure](project-structure.md) - File organization and component layout
- [ADR-0001](../architecture/adr-0001-aiad-integration.md) - AIAD integration architecture decision

**AIAD Classification**: 🏗️ Architecture | **Domain**: Static Site + AIAD Ecosystem
**Last Updated**: 2026-01-28 | **Maintainer**: Architecture Documentation Agent