---
name: testing
description: To be used when creating new tests or working with tests in the codebase.
---

Jest is the default testing framework. Tests live in `src/` alongside source files, named `*.test.ts` or `*.spec.ts`.

Each package needs:

- A `jest.config.cjs` (`.cjs` required because packages declare `"type": "module"`) that extends the root `jest.config.js`:
  ```js
  const baseConfig = require("../../jest.config.js");
  module.exports = baseConfig;
  ```
- A `test` script:
  ```json
  "test": "NODE_OPTIONS=--experimental-vm-modules jest --config jest.config.cjs"
  ```
