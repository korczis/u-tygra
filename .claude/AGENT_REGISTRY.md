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

## Total: 11 agents (5 Claude Code + 6 AIAD)
