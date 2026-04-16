# cli-runner

Command-line tool for collecting GitHub issues and pull requests and printing a summary table.

## What it does

`cli-runner` fetches issues and PRs from a GitHub repository for a given date range, caches the results locally via `@github-intelligence/issues-collector`, and prints a formatted table to stdout. Repeated runs for the same repository and date range return instantly from the cache.

## Usage

```bash
# Build first
npm run build

# Collect the last month of issues and PRs
node dist/index.js --repo <owner/repo>

# Specify a custom date range
node dist/index.js --repo facebook/react --from 2024-01-01 --to 2024-03-31

# Pass the token inline (overrides GITHUB_TOKEN env var)
node dist/index.js --repo facebook/react --token ghp_your_token
```

### Options

| Flag | Required | Description |
|------|----------|-------------|
| `--repo <owner/repo>` | Yes | Repository in `owner/repo` format |
| `--from <date>` | No | Start date in ISO format (default: 1 month ago) |
| `--to <date>` | No | End date in ISO format (default: today) |
| `--token <token>` | No | GitHub personal access token |

### Environment variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token |
| `GITHUB_BASE_URL` | GitHub API base URL (for GitHub Enterprise) |
| `CACHE_FOLDER` | Local cache directory path |

Place these in a `.env` file in this directory — `dotenv` loads it automatically.

## Example output

```
Type    #       Title                                           State     Author      Assignees
-------------------------------------------------------------------------------
issue   12345   Fix memory leak in useEffect cleanup           closed    acmarr      johndoe
pr      12346   Add support for concurrent rendering           open      janedoe     —
issue   12347   Document the new Suspense boundaries           closed    bobsmith    —
```

## Development

```bash
npm run type-check   # type-check without emitting
npm run build        # compile to dist/
npm run clean        # remove dist/
```
