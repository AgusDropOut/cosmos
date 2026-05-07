## 1. The Cosmos Pipeline

At its core, Cosmos is a visual compiler. The application follows a strict unidirectional data flow:

```mermaid
graph TD
    TODO

```


#### 2. Core Modules (Folder Structure)
Give a brief explanation of the `src/` directory so people know where to look.

* **`src/components/`**: Pure UI. React Flow nodes, modals, and toolbars. Absolutely *no* compiler logic goes here.
* **`src/core/compiler/`**: Contains the `TreeCompiler` (string generation for GLSL) and `AstEvaluator` (live math execution).
* **`src/core/contexts/`**: The state definitions for Material, Trail, and Beam environments.
* **`src/types/`**: All interfaces (`ShaderGraph`, `IProjectContext`) live here.

#### 3. How to Extend Cosmos (The Important Part)
This is where you answer the specific questions contributors will have. Instead of pasting the whole interface, explain the *pattern* they need to follow.

* **Adding a New Node:** TODO
* **Adding a New Context:** TODO
* **The Exporters:** TODO

---

