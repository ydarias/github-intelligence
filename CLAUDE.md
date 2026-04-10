# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Interview me until you have 95% confidence about what I actually want, not what I think I should want.

When asked to implement an issue or spec, they are located at the `specs` director.
## Commands

```bash
npm install          # install all dependencies
npm run build        # build all packages and apps (respects dependency order)
npm run dev          # run all apps in dev mode concurrently
npm run lint         # lint all packages and apps
npm run type-check   # TypeScript type-check across the monorepo
npm run test         # run all tests across the monorepo
npm run clean        # remove all build outputs

# Scoped to a single workspace:
npm run build --workspace=apps/my-app
npm run dev   --workspace=apps/my-app
npm run test  --workspace=packages/my-package
```

## Architecture

This is a Turborepo monorepo with npm workspaces.

- `apps/` — runnable applications. None exist yet.
- `packages/` — shared internal packages consumed by apps and other packages.
  - `packages/tsconfig/` — shared TypeScript configs. New packages and apps extend `@github-intelligence/tsconfig/base.json`.

### TypeScript

All packages use `NodeNext` module resolution. The base config (`packages/tsconfig/base.json`) enables strict mode, `noUncheckedIndexedAccess`, and `noImplicitOverride`. New packages must extend this base and compile to `dist/`.

### Testing

Jest is the default testing framework. Tests live in `src/` alongside source files, named `*.test.ts` or `*.spec.ts`.

Each package needs:
- A `jest.config.cjs` (`.cjs` required because packages declare `"type": "module"`) that extends the root `jest.config.js`:
  ```js
  const baseConfig = require('../../jest.config.js');
  module.exports = baseConfig;
  ```
- A `test` script:
  ```json
  "test": "NODE_OPTIONS=--experimental-vm-modules jest --config jest.config.cjs"
  ```

### Adding a new app or package

1. Create the directory under `apps/` or `packages/`.
2. Add a `package.json` with the `@github-intelligence/` scope name.
3. Add a `tsconfig.json` that extends `@github-intelligence/tsconfig/base.json`.
4. Declare `"@github-intelligence/tsconfig": "*"` as a `devDependency`.
5. Add a `jest.config.cjs` extending the root `jest.config.js` and a `test` script (see Testing section).
6. Run `npm install` from the root to link workspaces.

### Dependency versions

Use exact (fixed) versions — no `^` or `~` — for all dependencies.
