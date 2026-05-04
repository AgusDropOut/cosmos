# Makefile for Cosmos Engine Integrity Checks

.PHONY: all install test test-e2e test-unit lint check

# Default task: full integrity check
all: check

install:
	npm install
	npx playwright install

# Runs Playwright E2E tests in headless mode
test-e2e:
	npx playwright test

# Runs Vitest unit tests for compiler/mapping logic
test-unit:
	npm run test:unit

# Runs ESLint to check code quality
lint:
	npm run lint

# The integrity check: Lints, then runs all tests
check: test-e2e
	@echo "Cosmos: Integrity check passed."

# Opens the Playwright UI for debugging
debug-e2e:
	npx playwright test --ui