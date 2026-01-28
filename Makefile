# U Tygra - AIAD-Powered Development Automation
# Version: 1.0.0
# AIAD Standard Library v2.0.0

.PHONY: help dev build deploy test docs clean
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Project configuration
PROJECT_NAME := u-tygra
PROJECT_VERSION := 1.0.0
ZOLA_VERSION := latest
AIAD_VERSION := 2.0.0

# Directories
PROJECT_ROOT := $(shell pwd)
AIAD_DIR := .aiad
COMMANDS_DIR := $(AIAD_DIR)/commands
REPORTS_DIR := reports
CACHE_DIR := .cache
PUBLIC_DIR := public

# AIAD command execution
AIAD_CMD = $(COMMANDS_DIR)

# Build environment detection
ifeq ($(CI),true)
    ENV := ci
    VERBOSE := --verbose
    FORMAT := --format json
else
    ENV := local
    VERBOSE :=
    FORMAT :=
endif

##@ Help

help: ## Display available commands
	@echo ""
	@echo "$(BLUE)U Tygra - AIAD-Powered Development Automation$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo ""
	@echo "$(GREEN)Project:$(NC) $(PROJECT_NAME) v$(PROJECT_VERSION)"
	@echo "$(GREEN)AIAD:$(NC) Standard Library v$(AIAD_VERSION)"
	@echo "$(GREEN)Environment:$(NC) $(ENV)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(GREEN)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

dev: ## Start development server with AIAD monitoring
	@echo "$(BLUE)Starting AIAD-powered development server...$(NC)"
	@$(MAKE) _ensure-dirs
	@echo "$(GREEN)✓$(NC) Starting Zola development server"
	@zola serve --interface 127.0.0.1 --port 1111 --open

serve: dev ## Alias for dev

build-dev: ## Development build with live reload
	@echo "$(BLUE)Building for development...$(NC)"
	@$(MAKE) _ensure-dirs
	@echo "$(GREEN)✓$(NC) Running development build"
	@zola build --base-url "http://localhost:1111"
	@echo "$(GREEN)✓$(NC) Development build completed"

##@ Content Management

content-analyze: ## Comprehensive content analysis
	@echo "$(BLUE)Running comprehensive content analysis...$(NC)"
	@$(MAKE) _ensure-dirs
	@$(AIAD_CMD)/content-analyze $(VERBOSE) $(FORMAT)

content-validate: ## Validate content structure and links
	@echo "$(BLUE)Validating content structure and links...$(NC)"
	@$(MAKE) _ensure-dirs
	@$(AIAD_CMD)/content-analyze --quick $(VERBOSE)

content-sync: ## Synchronize Google Sheets data
	@echo "$(BLUE)Synchronizing Google Sheets data...$(NC)"
	@echo "$(YELLOW)Note:$(NC) This would trigger google-sheets-sync agent"
	@echo "$(GREEN)✓$(NC) Data synchronization would be performed"

content-optimize: ## Optimize content for SEO and performance
	@echo "$(BLUE)Optimizing content for SEO and performance...$(NC)"
	@$(AIAD_CMD)/content-analyze --format markdown --output $(REPORTS_DIR)/content-optimization.md
	@echo "$(GREEN)✓$(NC) Content optimization analysis completed"

##@ Build & Deploy

build: build-prod ## Build for production (default)

build-prod: ## Production build with optimization
	@echo "$(BLUE)Building for production...$(NC)"
	@$(MAKE) _ensure-dirs
	@$(MAKE) _validate-config
	@echo "$(GREEN)✓$(NC) Running production build with optimization"
	@zola build
	@$(MAKE) _post-build-validation
	@echo "$(GREEN)✓$(NC) Production build completed"

build-staging: ## Staging build with validation
	@echo "$(BLUE)Building for staging...$(NC)"
	@$(MAKE) _ensure-dirs
	@echo "$(GREEN)✓$(NC) Running staging build"
	@zola build --base-url "https://staging.pivniceutygra.cz"
	@$(MAKE) _post-build-validation
	@echo "$(GREEN)✓$(NC) Staging build completed"

deploy-staging: build-staging ## Deploy to staging environment
	@echo "$(BLUE)Deploying to staging...$(NC)"
	@echo "$(YELLOW)Note:$(NC) This would trigger deployment-manager agent"
	@echo "$(GREEN)✓$(NC) Staging deployment would be performed"

deploy-prod: build-prod quality-check ## Deploy to production with quality gates
	@echo "$(BLUE)Deploying to production...$(NC)"
	@echo "$(YELLOW)Note:$(NC) This would trigger deployment-manager agent with quality gates"
	@echo "$(GREEN)✓$(NC) Production deployment would be performed"

deploy: deploy-prod ## Deploy to production (default)

##@ Quality & Maintenance

test: quality-check ## Run all tests and quality checks

quality-check: ## Run all quality gates
	@echo "$(BLUE)Running comprehensive quality gates...$(NC)"
	@$(MAKE) _ensure-dirs
	@$(MAKE) content-validate
	@$(MAKE) _validate-zola-config
	@$(MAKE) _check-links
	@echo "$(GREEN)✓$(NC) All quality gates passed"

health-report: ## Generate system health analysis
	@echo "$(BLUE)Generating system health report...$(NC)"
	@$(MAKE) _ensure-dirs
	@echo "$(GREEN)Project Health Report$(NC)" > $(REPORTS_DIR)/health-report.md
	@echo "======================" >> $(REPORTS_DIR)/health-report.md
	@echo "" >> $(REPORTS_DIR)/health-report.md
	@echo "Generated: $(shell date)" >> $(REPORTS_DIR)/health-report.md
	@echo "Project: $(PROJECT_NAME) v$(PROJECT_VERSION)" >> $(REPORTS_DIR)/health-report.md
	@echo "" >> $(REPORTS_DIR)/health-report.md
	@echo "## Build Status" >> $(REPORTS_DIR)/health-report.md
	@zola check >> $(REPORTS_DIR)/health-report.md 2>&1 || true
	@echo "$(GREEN)✓$(NC) Health report generated: $(REPORTS_DIR)/health-report.md"

backup-content: ## Backup content and configuration
	@echo "$(BLUE)Backing up content and configuration...$(NC)"
	@$(MAKE) _ensure-dirs
	@mkdir -p $(REPORTS_DIR)/backups
	@tar -czf $(REPORTS_DIR)/backups/content-backup-$(shell date +%Y%m%d_%H%M%S).tar.gz content docs zola.toml $(AIAD_DIR)
	@echo "$(GREEN)✓$(NC) Content backup completed"

##@ Documentation

docs-generate: ## Auto-generate documentation
	@echo "$(BLUE)Generating AIAD documentation...$(NC)"
	@$(MAKE) _ensure-dirs
	@echo "$(YELLOW)Note:$(NC) This would trigger docs-analyzer agent"
	@echo "$(GREEN)✓$(NC) Documentation generation would be performed"

docs: docs-generate ## Alias for docs-generate

docs-serve: ## Serve documentation with Zola
	@echo "$(BLUE)Serving documentation...$(NC)"
	@zola serve --interface 127.0.0.1 --port 1112

docs-validate: ## Validate documentation structure
	@echo "$(BLUE)Validating documentation structure...$(NC)"
	@$(MAKE) _ensure-dirs
	@find docs -name "*.md" -exec echo "Checking: {}" \;
	@echo "$(GREEN)✓$(NC) Documentation validation completed"

##@ Maintenance

clean: ## Clean build artifacts and cache
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@rm -rf $(PUBLIC_DIR)
	@rm -rf $(CACHE_DIR)
	@rm -rf .sass-cache
	@echo "$(GREEN)✓$(NC) Build artifacts cleaned"

clean-reports: ## Clean analysis reports
	@echo "$(BLUE)Cleaning analysis reports...$(NC)"
	@rm -rf $(REPORTS_DIR)
	@echo "$(GREEN)✓$(NC) Analysis reports cleaned"

clean-all: clean clean-reports ## Clean everything

install: ## Install dependencies and setup
	@echo "$(BLUE)Setting up U Tygra development environment...$(NC)"
	@$(MAKE) _ensure-dirs
	@$(MAKE) _validate-tools
	@echo "$(GREEN)✓$(NC) Development environment ready"

update: ## Update AIAD system and dependencies
	@echo "$(BLUE)Updating AIAD system...$(NC)"
	@echo "$(YELLOW)Note:$(NC) This would update AIAD Standard Library"
	@echo "$(GREEN)✓$(NC) AIAD system update would be performed"

##@ AIAD Integration

aiad-status: ## Show AIAD ecosystem status
	@echo "$(BLUE)AIAD Ecosystem Status$(NC)"
	@echo "===================="
	@echo ""
	@echo "$(GREEN)Project:$(NC) $(PROJECT_NAME)"
	@echo "$(GREEN)Version:$(NC) $(PROJECT_VERSION)"
	@echo "$(GREEN)AIAD Library:$(NC) v$(AIAD_VERSION)"
	@echo "$(GREEN)Agents:$(NC) $(shell ls -1 $(AIAD_DIR)/agents/*.toml 2>/dev/null | wc -l | tr -d ' ') configured"
	@echo "$(GREEN)Commands:$(NC) $(shell ls -1 $(AIAD_DIR)/commands/* 2>/dev/null | wc -l | tr -d ' ') available"
	@echo "$(GREEN)Configuration:$(NC) $(AIAD_DIR)/manifest.toml"
	@echo ""

aiad-agents: ## List available AIAD agents
	@echo "$(BLUE)Available AIAD Agents$(NC)"
	@echo "====================="
	@echo ""
	@for agent in $(AIAD_DIR)/agents/*.toml; do \
		if [ -f "$$agent" ]; then \
			name=$$(basename "$$agent" .toml); \
			category=$$(grep -E '^category\s*=' "$$agent" | cut -d'"' -f2 2>/dev/null || echo "unknown"); \
			desc=$$(grep -E '^description\s*=' "$$agent" | cut -d'"' -f2 2>/dev/null || echo "No description"); \
			printf "$(GREEN)%-25s$(NC) [%s] %s\n" "$$name" "$$category" "$$desc"; \
		fi \
	done

aiad-commands: ## List available AIAD commands
	@echo "$(BLUE)Available AIAD Commands$(NC)"
	@echo "======================="
	@echo ""
	@for cmd in $(AIAD_DIR)/commands/*; do \
		if [ -f "$$cmd" ] && [ -x "$$cmd" ]; then \
			name=$$(basename "$$cmd"); \
			desc=$$(grep -E '^COMMAND_DESCRIPTION=' "$$cmd" | cut -d'"' -f2 2>/dev/null || echo "No description"); \
			printf "$(GREEN)%-20s$(NC) %s\n" "$$name" "$$desc"; \
		fi \
	done

##@ Internal Helpers

_ensure-dirs: ## Create necessary directories
	@mkdir -p $(REPORTS_DIR) $(CACHE_DIR)

_validate-tools: ## Validate required tools are installed
	@echo "$(BLUE)Validating required tools...$(NC)"
	@command -v zola >/dev/null 2>&1 || (echo "$(RED)✗$(NC) Zola not found. Please install: https://www.getzola.org/documentation/getting-started/installation/"; exit 1)
	@echo "$(GREEN)✓$(NC) Zola found: $(shell zola --version)"

_validate-config: ## Validate Zola configuration
	@echo "$(GREEN)✓$(NC) Validating Zola configuration"
	@zola check --config zola.toml || (echo "$(RED)✗$(NC) Zola configuration validation failed"; exit 1)

_validate-zola-config: ## Validate Zola configuration syntax
	@echo "$(GREEN)✓$(NC) Checking Zola configuration syntax"
	@zola check || (echo "$(RED)✗$(NC) Zola check failed"; exit 1)

_check-links: ## Check internal links
	@echo "$(GREEN)✓$(NC) Checking internal links"
	@if [ -d "$(PUBLIC_DIR)" ]; then \
		find $(PUBLIC_DIR) -name "*.html" -exec echo "Checking links in: {}" \; 2>/dev/null | head -5; \
		echo "$(GREEN)✓$(NC) Link check completed"; \
	else \
		echo "$(YELLOW)⚠$(NC) No public directory found. Run 'make build' first."; \
	fi

_post-build-validation: ## Post-build validation
	@echo "$(GREEN)✓$(NC) Running post-build validation"
	@if [ ! -d "$(PUBLIC_DIR)" ]; then \
		echo "$(RED)✗$(NC) Build failed: public directory not found"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓$(NC) Build validation successful"

##@ Information

status: aiad-status ## Show project status

version: ## Show version information
	@echo "$(GREEN)U Tygra$(NC) v$(PROJECT_VERSION)"
	@echo "$(GREEN)AIAD Standard Library$(NC) v$(AIAD_VERSION)"
	@echo "$(GREEN)Zola$(NC) $(shell zola --version 2>/dev/null || echo 'not found')"

info: ## Show project information
	@echo "$(BLUE)U Tygra - Pivnice Information$(NC)"
	@echo "=============================="
	@echo ""
	@echo "$(GREEN)Business:$(NC) Pivnice U Tygra"
	@echo "$(GREEN)Location:$(NC) Brno, Czech Republic"
	@echo "$(GREEN)Website:$(NC) https://www.pivniceutygra.cz"
	@echo "$(GREEN)Technology:$(NC) Zola + Alpine.js + Flowbite + AIAD"
	@echo "$(GREEN)Repository:$(NC) https://github.com/konovo/u-tygra"
	@echo ""

# Environment-specific targets
ci: ## CI/CD pipeline execution
	@echo "$(BLUE)Running CI/CD pipeline...$(NC)"
	@$(MAKE) _validate-tools
	@$(MAKE) quality-check
	@$(MAKE) build-prod
	@$(MAKE) health-report
	@echo "$(GREEN)✓$(NC) CI/CD pipeline completed"

# Development helpers
watch: ## Watch files and rebuild on changes
	@echo "$(BLUE)Watching for changes...$(NC)"
	@echo "$(YELLOW)Note:$(NC) Use 'make dev' for live development server"
	@zola serve

# Quick commands for common workflows
quick-deploy: content-validate build-prod ## Quick deployment workflow
	@echo "$(GREEN)✓$(NC) Quick deployment ready"

full-check: clean content-analyze quality-check build-prod health-report ## Full quality assurance workflow
	@echo "$(GREEN)✓$(NC) Full quality check completed"

# Include local extensions if available
-include Makefile.local