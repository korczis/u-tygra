# Agent Registry - Pivnice U Tygra

## Claude Code Agents (.claude/agents/)

| Agent | Description | Tools |
|-------|-------------|-------|
| **commit-coordinator** | Atomic git commits with conventional format | Bash, Read, Glob, Grep |
| **deploy-manager** | Dual deployment (GitHub/GitLab Pages) with validation | Bash, Read, Glob, Grep |
| **code-reviewer** | Quality, a11y, SEO, Czech localization review | Bash, Read, Glob, Grep |
| **content-manager** | Beer menu, food, Google Sheets integration | Bash, Read, Write, Edit, Glob, Grep |
| **session-tracker** | Session context continuity across conversations | Read, Write, Glob |

## AIAD Agents (.aiad/agents/)

| Agent | Description | Format |
|-------|-------------|--------|
| **build-orchestrator** | Zola build processes and optimization | TOML |
| **content-validator** | Content structure, links, Czech localization | TOML |
| **docs-analyzer** | Documentation completeness and consistency | TOML |
| **google-sheets-sync** | Live beer menu synchronization | TOML |
| **link-integrity-checker** | External URLs, internal paths, data endpoints | TOML |
| **quality-gate-sentinel** | Quality standards enforcement | TOML |

## AIAD Commands (.aiad/commands/)

| Command | Description | Usage |
|---------|-------------|-------|
| **content-analyze** | Content structure analysis | `make content-analyze` |
| **test-links** | Link integrity (ext + int + data) | `make test-links` |
| **validate** | Pre-push: build + check + assets | `make validate` |
| **dev-check** | Dev environment health check | `make dev-check` |
| **deploy-status** | GitHub/GitLab deployment status | `make deploy-status` |

## Totals: 11 agents (5 Claude + 6 AIAD), 5 commands
