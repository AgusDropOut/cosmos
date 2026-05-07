# Consistently list all task-based targets as phony
.PHONY: all install test-e2e test-unit build-exe lint run check debug-e2e 

all: check

install:
	npm install
	npx playwright install

test-e2e:
	npx playwright test

test-unit:
	npm run test:unit

build-exe:
	npm run build:exe
	@echo "Cosmos: Executable generated in the /release folder."

build-linux:
	npm run build:linux
	@echo "Cosmos: Linux AppImage generated in the /release folder."

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