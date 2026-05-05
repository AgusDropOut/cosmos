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

# Integrity check: Relies on Playwright config to manage the server lifecycle
check:
	npx playwright test
	@echo "Cosmos: Integrity check passed."

debug-e2e:
	npx playwright test --ui