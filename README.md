<div align="center">
  <img src="https://github.com/user-attachments/assets/b90a50d3-cc30-4fb9-a127-fd056cc55da3" alt="Cosmos Engine Logo" width="400" />

  ### A Data-Driven Visual Effects IDE for Minecraft
  
  [Wiki & Documentation](https://github.com/AgusDropOut/cosmos/wiki) | [Cosmos API (Java)](https://github.com/AgusDropOut/cosmos-api)
</div>


---

> **⚠️ Current Status: Active Development** > Cosmos is currently in early active development. **There are currently no official release downloads or compiled binaries available.**

## 🌌 Overview

This repository hosts the **Cosmos Node Editor and Live Preview**, a web-based IDE designed to solve the limitations of standard Minecraft entity rendering. 

While the [Cosmos API](https://github.com/AgusDropOut/cosmos-api) handles the Java-side implementation in-game, this repository contains the visual toolset. It allows visual artists and developers to design complex shaders, geometric trails, volumetric beams, and AST math evaluations using an industry-standard node graph. The editor automatically compiles these visual graphs into GLSL shaders and strict JSON metadata to be consumed by the Minecraft engine.

## 📚 User Documentation

If you are looking for tutorials on how to use the Cosmos Editor to create Minecraft effects, please refer to our **[Official Wiki](https://github.com/AgusDropOut/cosmos/wiki)**.

---

## 🛠️ Tech Stack

Cosmos is built using modern web technologies to ensure a high-performance, strictly-typed development environment:

* **Core:** React 18, TypeScript, Vite
* **Node Environment:** [React Flow](https://reactflow.dev/) (Canvas UI), [Dagre](https://github.com/dagrejs/dagre) (Auto-layout routing)
* **3D Previewer:** [Three.js](https://threejs.org/) (WebGL Rendering)
* **Testing:** Vitest (Unit/Integration with JSDOM), Playwright (E2E & Smoke Testing)

## 🚀 Local Development

Cosmos utilizes a `Makefile` to standardize development and testing workflows. To get the engine running locally:

### Prerequisites
* Node.js (v18+)
* npm or pnpm

### Commands

| Command | Description |
| :--- | :--- |
| `make install` | Installs all required Node.js dependencies and Playwright browser binaries. |
| `make run` | Starts the Vite local development server with hot-module reloading. |
| `make lint` | Runs the linter to ensure code style consistency. |
| `make test-unit` | Runs the Vitest suite (tests pure logic, hooks, compilers, and parsers). |
| `make test-e2e` | Triggers the Playwright browser tests to verify WebGL and canvas UI stability. |
| `make debug-e2e` | Opens Playwright's interactive UI mode to visually debug failing E2E tests. |
| `make check` | **Recommended before PRs:** Runs the comprehensive integrity check (Unit + E2E tests). |

---

## 🤝 Interested in Collaborating?

We are always open to community contributions, whether you are fixing a bug in the AST compiler, adding a new node type, or improving the WebGL previewer!

To ensure a smooth onboarding process and maintain the stability of the engine, please review our developer documentation before opening a Pull Request:

1. **[ARCHITECTURE.md](./ARCHITECTURE.md):** Read this first to understand how data flows from the React Flow UI, through the `TreeCompiler`, and into the 3D Canvas.
2. **[CONTRIBUTING.md](./CONTRIBUTING.md):** Review our Git branching strategies, testing requirements (no PRs are accepted without passing unit/smoke tests), and PR templates.

If you find a bug or have a feature request, feel free to open an Issue!
