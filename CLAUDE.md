# CLAUDE.md

When working with this codebase, prioritize readability over cleverness.

Interview me until you have 95% confidence about what I actually want, not what I think I should want.

When asked to implement an issue or spec, they are located at the `specs` director.

## Architecture

This is a Turborepo monorepo with npm workspaces.

- `apps/` — runnable applications. None exist yet.
- `packages/` — shared internal packages consumed by apps and other packages.
  - `packages/tsconfig/` — shared TypeScript configs. New packages and apps extend `@github-intelligence/tsconfig/base.json`.
  - `packages/issues-collector` — library to collect and store in a cache issues from Github. 

## TypeScript

All packages use `NodeNext` module resolution. The base config (`packages/tsconfig/base.json`) enables strict mode, `noUncheckedIndexedAccess`, and `noImplicitOverride`. New packages must extend this base and compile to `dist/`.

## Dependency versions

Use exact (fixed) versions — no `^` or `~` — for all dependencies.
