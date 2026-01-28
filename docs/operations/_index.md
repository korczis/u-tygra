+++
title = "Operations"
description = "Deployment, monitoring, and maintenance procedures"
template = "section.html"
weight = 4
+++

# Operations Documentation

Comprehensive procedures for deployment, monitoring, and maintenance of the U Tygra project.

<!-- NAV_START -->
## Navigation

**Current Location**: [Documentation](../) > 🛠️ Operations

### Quick Links
- **📚 [Documentation Home](../)**
- **📖 [Guides](../guides/)**
- **📑 [Reference](../reference/)**
<!-- NAV_END -->

## Operations Procedures

### [Build & Deployment](build-deployment.md)
Complete procedures for building, testing, and deploying the U Tygra site across multiple environments.

### [Monitoring](monitoring.md)
System monitoring setup, performance tracking, analytics configuration, and health check procedures.

### [Backup Procedures](backup-procedures.md)
Data backup strategies, content versioning, and disaster recovery procedures for business continuity.

### [Incident Response](incident-response.md)
Emergency procedures, troubleshooting workflows, and escalation protocols for operational issues.

## Operational Environments

| Environment | Purpose | URL | Deploy Method |
|-------------|---------|-----|---------------|
| Development | Local testing | localhost:1111 | `make dev` |
| Staging | Pre-production validation | TBD | `make deploy-staging` |
| Production | Live website | pivniceutygra.cz | `make deploy-prod` |

## Key Operational Metrics

- **Build Time**: <30 seconds (target)
- **Deployment Time**: <5 minutes (target)
- **Uptime Target**: 99.9%
- **Performance Score**: >90 (Lighthouse)
- **Accessibility Score**: >95 (WCAG 2.1 AA)

## AIAD Operations Integration

The operations are enhanced by AIAD ecosystem components:

- **quality-gate-sentinel**: Enforces quality standards during deployment
- **performance-monitor**: Continuously tracks site performance metrics
- **deployment-manager**: Manages intelligent deployment workflows
- **incident-response**: Automated incident detection and response

## Emergency Contacts

- **Technical Issues**: Development team via project repository
- **Business Issues**: KONOVO s.r.o. (+420 777 935 052)
- **Website Issues**: Bar management (+420 776 140 840)

---

*Comprehensive operational procedures ensuring reliable service delivery.*