# reporter

Web dashboard for exploring cached GitHub issues and pull requests.

## What it does

`reporter` reads issues and PRs that were previously collected by `cli-runner` from the local cache and serves them through a React SPA backed by an Express API. It visualises the data with summary statistics, a time-series chart, and filterable tables.

## Architecture

```
reporter/
├── src/
│   ├── server/         # Express API
│   │   ├── index.ts    # Server entry point
│   │   ├── router.ts   # API route handlers
│   │   └── stats.ts    # Stats computation (totals, open/closed, by-day)
│   └── client/         # React SPA (built with Vite)
│       ├── App.tsx      # Root component, tab navigation, filtering state
│       ├── api.ts       # Fetch wrapper for the /api/issues endpoint
│       ├── types.ts     # Shared TypeScript types for API responses
│       └── components/
│           ├── StatsSummary.tsx        # Summary count cards
│           ├── IssuesOverTimeChart.tsx # Issues/PRs-per-day area chart (Recharts)
│           └── IssueTable.tsx          # Paginated table with author/assignee filters
```

The server and client are compiled independently. In production the Express server also serves the pre-built client bundle. In development both run concurrently via `concurrently`.

### API

`GET /api/issues` — returns all cached items (issues + PRs) sorted by creation date, plus aggregate stats.

```json
{
  "total": 120,
  "open": 34,
  "closed": 86,
  "issues": [...],
  "stats": {
    "total": 120,
    "open": 34,
    "closed": 86,
    "byDay": [{ "date": "2024-01-01", "issues": 4, "prs": 2 }, ...]
  }
}
```

If no cached data is found the endpoint returns `404` with an error message directing you to run the CLI first.

## Dashboard features

- **Stats summary** — total, open, and closed counts that update as you filter.
- **Issues over time chart** — area chart showing issues and PRs created per day.
- **Tabbed views**:
  - _All Issues_ — full list with author and assignee filters.
  - _Same Day_ — items closed on the same day they were opened.
  - _Still Open_ — items still in open state.
  - _By Author_ — filter by a specific author across all items.
- **Pagination** — 50 items per page.

## Getting started

```bash
# Collect data first (from the repo root)
node apps/cli-runner/dist/index.js --repo facebook/react

# Development mode (server + client with hot reload)
cd apps/reporter
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Scripts

```bash
npm run dev          # start server (tsx watch) + Vite dev server concurrently
npm run build        # compile server (tsc) + bundle client (vite build)
npm start            # run the compiled production server
npm run type-check   # type-check server and client tsconfigs
npm run clean        # remove dist/
```

## Environment variables

| Variable       | Description                                                 | Default   |
| -------------- | ----------------------------------------------------------- | --------- |
| `GITHUB_TOKEN` | GitHub personal access token                                | —         |
| `CACHE_FOLDER` | Path to the local cache directory written by the CLI        | `.cache/` |
| `PORT`         | HTTP port for the Express server                            | `3001`    |
| `NODE_ENV`     | Set to `production` to serve the client bundle from Express | —         |

Place these in a `.env` file in this directory.

## Technical decisions

- **Express + React** — thin API layer to read the local cache; React SPA for the interactive dashboard. No persistent backend or database needed.
- **Vite for the client** — fast bundler with first-class React and TypeScript support.
- **Recharts** — declarative charting library that composes well with React without requiring an external canvas or SVG abstraction.
- **Separate tsconfigs for server and client** — `tsconfig.server.json` targets CommonJS-compatible Node output; `tsconfig.client.json` targets ESNext for Vite. Keeping them separate avoids DOM/Node type conflicts.
