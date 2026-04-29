# Spec: GitHub Client Package + CLI Subcommands Refactor

## Objective

Two related changes:

1. Extract the duplicated `GitHubClient` class from `issues-collector` and `members-collector` into a new shared `packages/github-client` package. Both collector packages then depend on it.
2. Refactor `apps/cli-runner` from its current flat-flags design into proper commander subcommands (`issues`, `prs`, `members`).

**Why:** The `GitHubClient` class is copy-pasted between both collector packages — any change (auth, base URL, pagination) must be made twice. The CLI has a `TODO` comment acknowledging it should use subcommands.

## Tech Stack

- TypeScript 5.7.3, NodeNext module resolution, strict mode
- `@octokit/rest` 22.0.1 for GitHub API
- `commander` 14.0.3 for CLI subcommands
- `dotenv` 17.4.2 for env/token loading
- `date-fns` 4.1.0 for default date calculation
- `flat-cache` 6.1.22 for local caching (already in collector packages)

## Commands

```
Build all:      npm run build
Type-check:     npm run type-check
Test:           npm test
Clean:          npm run clean
Run CLI:        node apps/cli-runner/dist/index.js <subcommand> [options]
```

## Project Structure

```
packages/github-client/
  src/
    github-client.ts     → Unified GitHubClient (listIssues, listPRs, listOrgMembers)
    types.ts             → Shared GitHub API types (GitHubIssue, OrgMember)
    index.ts             → Public exports
  package.json
  tsconfig.json

packages/issues-collector/
  src/
    github-client.ts     → DELETED — replaced by @github-intelligence/github-client
    types.ts             → Keeps FetchIssuesOptions; GitHubIssue imported from github-client

packages/members-collector/
  src/
    github-client.ts     → DELETED — replaced by @github-intelligence/github-client
    types.ts             → OrgMember imported from github-client

apps/cli-runner/
  src/
    index.ts             → Subcommand wiring (issues, prs, members)
    printer.ts           → Unchanged (table output)
```

## Code Style

Subcommand wiring in `index.ts`:

```typescript
import "dotenv/config";
import { Command } from "commander";
import { subMonths } from "date-fns";

const program = new Command();

program
  .command("issues")
  .requiredOption("--repo <owner/repo>")
  .option("--from <date>")
  .option("--to <date>")
  .action(async (opts) => {
    const to = opts.to !== undefined ? new Date(opts.to) : new Date();
    const from = opts.from !== undefined ? new Date(opts.from) : subMonths(to, 1);
    // ...
  });

program.parse(process.argv);
```

Types flow: `github-client` exports `GitHubIssue` and `OrgMember` → collector packages re-export them for consumers that already depend on collectors.

## Testing Strategy

- No new tests required for this refactor — behaviour is unchanged, only package boundaries move.
- Existing tests in `issues-collector` must continue to pass after the dependency swap.
- Build (`tsc`) and type-check across all packages is the primary verification.

## CLI Usage After Refactor

```
# Collect issues
node dist/index.js issues --repo owner/repo --from 2024-01-01 --to 2024-03-31

# Collect pull requests
node dist/index.js prs --repo owner/repo --from 2024-01-01 --to 2024-03-31

# Collect org members
node dist/index.js members --org my-org
```

- `--from` and `--to` are optional; default to 1 month ago → today (matching current behaviour).
- `--token` flag removed; token read exclusively from `GITHUB_TOKEN` env var or `.env` file.
- Progress/results printed to stdout via existing `Printer` class.

## Boundaries

- **Always:** Keep exact dependency versions (no `^`/`~`). Re-export types from collector packages so existing consumers don't break.
- **Ask first:** Adding any new npm dependency. Changing the `GitHubIssue` or `OrgMember` type shape.
- **Never:** Introduce breaking changes to the public API of `issues-collector` or `members-collector`.

## Implementation Order

1. Create `packages/github-client` with unified client and types.
2. Update `packages/issues-collector`: remove `github-client.ts`, depend on new package, re-export types.
3. Update `packages/members-collector`: remove `github-client.ts`, depend on new package, re-export types.
4. Refactor `apps/cli-runner/src/index.ts` to use commander subcommands.

## Success Criteria

- `npm run build` succeeds across all packages with no type errors.
- `node apps/cli-runner/dist/index.js issues --repo <owner/repo>` works end-to-end.
- `node apps/cli-runner/dist/index.js prs --repo <owner/repo>` works end-to-end.
- `node apps/cli-runner/dist/index.js members --org <org>` works end-to-end.
- No `github-client.ts` files remain in `issues-collector` or `members-collector`.
- Existing `issues-collector` tests pass unchanged.

## Open Questions

_None — requirements are fully resolved._
