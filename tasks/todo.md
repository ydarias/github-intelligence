# Task List

## Phase 1

- [x] **Task 1** — Create `packages/github-client` (unified client + types)
- [x] **CHECKPOINT 1** — `github-client` builds cleanly

## Phase 2

- [x] **Task 2** — Update `packages/issues-collector`
- [x] **Task 3** — Update `packages/members-collector`
- [x] **CHECKPOINT 2** — Both collectors build; `find packages -name github-client.ts` returns nothing

## Phase 3

- [x] **Task 4** — Refactor `apps/cli-runner` to commander subcommands
- [x] **CHECKPOINT 3 (FINAL)** — `npm run build` from root; `npm test`; smoke test all subcommands
