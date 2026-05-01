# Plan: GitHub Client Package + CLI Subcommands Refactor

## Dependency Graph

```
@github-intelligence/tsconfig (base, unchanged)
        ↓
@github-intelligence/github-client  (NEW)
        ↓                 ↓
issues-collector   members-collector
        ↓                 ↓
            cli-runner
```

`github-client` must be built first — all other packages depend on it.
`issues-collector` and `members-collector` can be updated in parallel.
`cli-runner` updated last (depends on both collectors being updated).

---

## Task 1 — Create `packages/github-client`

Merge the two divergent `GitHubClient` implementations into one package.
Move `GitHubIssue` (from issues-collector) and `OrgMember` (from members-collector) here as the canonical type definitions.

**Files to create:**

- `packages/github-client/src/github-client.ts` — unified class with `listIssues`, `listPRs`, `listOrgMembers`
- `packages/github-client/src/types.ts` — `GitHubIssue`, `OrgMember`
- `packages/github-client/src/index.ts` — public exports
- `packages/github-client/package.json` — depends on `@octokit/rest`; no `^`/`~`
- `packages/github-client/tsconfig.json` — extends `@github-intelligence/tsconfig/base.json`

**Acceptance criteria:**

- `cd packages/github-client && npm run build` succeeds with no type errors
- `dist/index.js` and `dist/index.d.ts` are emitted
- Exports: `GitHubClient`, `GitHubIssue`, `OrgMember`

---

### CHECKPOINT 1 — `github-client` builds cleanly

Run `npm run build` from repo root; only `github-client` needs to succeed at this point.

---

## Task 2 — Update `packages/issues-collector`

Remove local copy of `GitHubClient`; import types from the new package.

**Changes:**

- `package.json` — add `"@github-intelligence/github-client": "*"` to `dependencies`; remove `@octokit/rest` (no longer needed directly)
- `src/github-client.ts` — **DELETE**
- `src/types.ts` — remove `GitHubIssue` definition; import it from `@github-intelligence/github-client`; keep `FetchIssuesOptions`
- `src/issues-collector.ts` — update import of `GitHubClient` to use `@github-intelligence/github-client`
- `src/pull-requests-collector.ts` — same import update
- `src/index.ts` — remove `GitHubClient` export; re-export `GitHubIssue` from `@github-intelligence/github-client` (so existing consumers of this package don't break)

**Acceptance criteria:**

- `npm test` (issues-collector) passes unchanged
- `npm run build` (issues-collector) succeeds
- No `github-client.ts` exists in `packages/issues-collector/src/`
- `GitHubIssue` is still importable from `@github-intelligence/issues-collector`

---

## Task 3 — Update `packages/members-collector`

Mirror of Task 2 for the members side.

**Changes:**

- `package.json` — add `"@github-intelligence/github-client": "*"`; remove `@octokit/rest`
- `src/github-client.ts` — **DELETE**
- `src/types.ts` — remove `OrgMember` definition; import it from `@github-intelligence/github-client`
- `src/members-collector.ts` — update import of `GitHubClient`
- `src/index.ts` — remove `GitHubClient` export; re-export `OrgMember` from `@github-intelligence/github-client`

**Acceptance criteria:**

- `npm run build` (members-collector) succeeds
- No `github-client.ts` exists in `packages/members-collector/src/`
- `OrgMember` is still importable from `@github-intelligence/members-collector`

---

### CHECKPOINT 2 — Both collectors build; no local github-client.ts files remain

Verify: `find packages -name github-client.ts` returns nothing.
Run `npm run build` for both collector packages.

---

## Task 4 — Refactor `apps/cli-runner` to subcommands

Replace the flat-flags design with three proper commander subcommands.

**Changes:**

- `package.json` — add `"@github-intelligence/github-client": "*"` to `dependencies`
- `src/index.ts` — full rewrite:
  - Import `GitHubClient` from `@github-intelligence/github-client` (not from collectors)
  - Remove the aliased `MembersGitHubClient` import
  - Remove `--token` flag
  - Wire `issues` subcommand: `--repo <owner/repo>`, `--from`, `--to`
  - Wire `prs` subcommand: `--repo <owner/repo>`, `--from`, `--to`
  - Wire `members` subcommand: `--org <org>`
  - Each subcommand is self-contained (instantiates its own client, repository, collector)
- `src/printer.ts` — **unchanged**

**Acceptance criteria:**

- `npm run build` (cli-runner) succeeds
- `node apps/cli-runner/dist/index.js issues --repo owner/repo` exits without crash (network call aside)
- `node apps/cli-runner/dist/index.js prs --repo owner/repo` same
- `node apps/cli-runner/dist/index.js members --org org` same
- `node apps/cli-runner/dist/index.js --help` shows three subcommands

---

### CHECKPOINT 3 (FINAL) — Full monorepo build succeeds

- `npm run build` from repo root — zero errors
- `npm test` — all existing tests pass
- `find packages -name github-client.ts` — empty
- Manual smoke test of all three subcommands
