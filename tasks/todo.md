# Task List

## Phase 1

- [ ] **Task 1** — Create `packages/github-client` (unified client + types)
  - New package: `github-client.ts`, `types.ts`, `index.ts`, `package.json`, `tsconfig.json`
  - Verify: `npm run build` passes in the package

- [ ] **CHECKPOINT 1** — `github-client` builds cleanly

## Phase 2

- [ ] **Task 2** — Update `packages/issues-collector`
  - Add github-client dep, delete local `github-client.ts`, update imports, re-export `GitHubIssue`
  - Verify: tests pass, build succeeds

- [ ] **Task 3** — Update `packages/members-collector`
  - Add github-client dep, delete local `github-client.ts`, update imports, re-export `OrgMember`
  - Verify: build succeeds

- [ ] **CHECKPOINT 2** — Both collectors build; `find packages -name github-client.ts` returns nothing

## Phase 3

- [ ] **Task 4** — Refactor `apps/cli-runner` to commander subcommands
  - Add github-client dep, rewrite `index.ts` with `issues`, `prs`, `members` subcommands
  - Verify: build succeeds, `--help` shows subcommands

- [ ] **CHECKPOINT 3 (FINAL)** — `npm run build` from root; `npm test`; smoke test all subcommands
