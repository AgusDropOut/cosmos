# Contributing to Cosmos Engine

First off, thank you for considering contributing to Cosmos! 🌌 

Whether you are fixing a bug in the AST compiler, adding a new React Flow node type, or optimizing the Three.js previewer, your help is incredibly valuable.

To ensure a smooth onboarding process and to protect the stability of the engine, please follow the guidelines below.

---

## 🏗️ 1. Before You Code

Before you dive into the codebase, it is highly recommended to understand how data flows through Cosmos:
* Read the **[ARCHITECTURE.md](./ARCHITECTURE.md)** to grasp how the React Flow UI translates into JSON metadata and GLSL shaders.
* Familiarize yourself with the **[README.md](./README.md)** for local setup and Makefile commands.

If you are planning a massive architectural change or a brand new context (e.g., adding a "Particle System" context), please **open an Issue first** to discuss it. We don't want you to waste hours on a PR that doesn't align with the engine's roadmap.

---

## 🐛 2. Reporting Bugs & Requesting Features

We use GitHub Issues to track bugs and feature requests. 

* **Bugs:** Please provide steps to reproduce, what you expected to happen, and what actually happened. If the WebGL canvas crashes, include the browser console logs.
* **Features:** Explain the use case. If you are requesting a new mathematical node, explain the GLSL output it should generate.

---

## 🧪 3. Test whatever you can!

Cosmos relies heavily on complex logic to compile ASTs, manage history matrices, and evaluate math in real-time. **If your PR touches anything in `src/core/`, it must be accompanied by tests.**

* **Unit Tests (`make test-unit`):** If you add a new hook or compiler strategy, write a Vitest suite for it.
* **Smoke/E2E Tests (`make test-e2e`):** If you modify the UI or the WebGL canvas, ensure the Playwright tests still pass.

Before pushing any code, run the integrity check:
```bash
make check
```

If make check fails, your PR will not be accepted.

## 🎨 4. Code Style

  * React Flow: Keep visual state separate from logical state. UI properties (like node x/y coordinates) should never influence the shader compiler.

  * WebGL/Three.js: Ensure you dispose of geometries and materials when components unmount to prevent memory leaks in the browser.

## 🚀 5. Pull Request Process

  1. Fork the repository and create your branch from main.
  
  2. Write your code, update the TSDoc headers for new functions, and write your tests.

  3. Run make check locally to verify everything is green.

  4. Open a Pull Request.

  5. Fill out the automated PR Template completely.

  A maintainer will review your code. We may request changes to ensure it fits the app's architecture.

Once approved, your code will be merged into Cosmos. Thank you!


***
