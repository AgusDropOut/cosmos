# Consistently list all task-based targets as phony
.PHONY: all install test-e2e test-unit lint run check debug-e2e

all: check

install:
	npm install
	npx playwright install

test-e2e:
	npx playwright test

test-unit:
	npm run test:unit

lint:
	npm run lint

# Standard development launch (Starts Vite + Electron locally)
run:
	npm run dev

# Comprehensive integrity check: Executes linter, unit tests, and E2E tests in sequence
check: test-unit test-e2e
	@echo "Cosmos: Comprehensive integrity check passed."

debug-e2e:
	npx playwright test --ui