---
name: new-app
description: To be used when adding a new app or package to the project.
---

1. Create the directory under `apps/` or `packages/`.
   1. `apps/` for a standlone app, it could be a CLI, UI, etc.
   2. `packages/` for a library or common configuration package.
2. Add a `package.json` with the `@github-intelligence/` scope name.
3. Add a `tsconfig.json` that extends `@github-intelligence/tsconfig/base.json`.
4. Declare `"@github-intelligence/tsconfig": "*"` as a `devDependency`.
5. Add a `jest.config.cjs` extending the root `jest.config.js` and a `test` script (see Testing section).
6. Run `npm install` from the root to link workspaces.
