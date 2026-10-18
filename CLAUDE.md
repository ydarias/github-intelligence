# CLAUDE.md

When working with this codebase, prioritize readability over cleverness.

Interview me until you have 95% confidence about what I actually want, not what I think I should want.

## Architecture

This is a Turborepo monorepo with npm workspaces.

- `apps/` — runnable applications.
  - `apps/api` — NestJS REST API serving cached issues, members and stats.
  - `apps/cli` — CLI to collect issues, PRs and members from GitHub into the cache.
  - `apps/ui` — React + Vite dashboard.
  - Layering: the ui talks to the api over REST and imports only types from `api-contracts`. Stats and filter logic live in the api.
- `packages/` — shared internal packages consumed by apps and other packages.
  - `packages/tsconfig/` — shared TypeScript configs. New packages and apps extend `@github-intelligence/tsconfig/base.json`.
  - `packages/api-contracts` — Zod schemas and types for the api responses and queries.
  - `packages/github-client` — GitHub API client.
  - `packages/issues` — library to collect and store in a cache issues from Github.
  - `packages/members` — library to collect and store in a cache the members of an organization.

## TypeScript

All packages use `NodeNext` module resolution. The base config (`packages/tsconfig/base.json`) enables strict mode, `noUncheckedIndexedAccess`, and `noImplicitOverride`. New packages must extend this base and compile to `dist/`.

## Dependency versions

Use exact (fixed) versions — no `^` or `~` — for all dependencies.
