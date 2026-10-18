# api

REST API that serves the issues, PRs and members previously collected by `cli`, plus the stats computed from them.

## What it does

`api` reads the local cache written by `cli` and exposes it under the `/api` prefix. Filtering and stats (report, throughput, cycle time...) are computed here, so clients only render the results. Request and response schemas live in `@github-intelligence/api-contracts` and are validated with Zod. If the cache is empty, routes answer `404 { "error": "No cached issues found. Run the CLI first." }`.

## Usage

```bash
# Build first
npm run build

npm start
```

During development use `npm run dev` (from the repo root it starts the API together with the UI).

### Routes

| Route                  | Description                                                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/issues`      | Issues and PRs, stats and filter options. Query: `type`, `title`, `state`, `author`, `assignee`, `labels` (comma separated), `oneDayOnly`. An invalid query returns `400`. |
| `GET /api/members`     | Cached organization members                                                                                                                                                |
| `GET /api/report`      | Open items per day                                                                                                                                                         |
| `GET /api/aging-wip`   | Aging work in progress                                                                                                                                                     |
| `GET /api/throughput`  | Weekly throughput                                                                                                                                                          |
| `GET /api/cycle-time`  | Cycle time                                                                                                                                                                 |
| `GET /api/quick-close` | Items closed the same day they were opened                                                                                                                                 |

### Environment variables

| Variable       | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| `PORT`         | HTTP port (default: `3001`)                                          |
| `CACHE_FOLDER` | Local cache directory path (default: `/tmp/.cache/issues-collector`) |

Place these in a `.env` file in this directory — `dotenv` loads it automatically. Under `npm run dev`, Turbo only forwards `CACHE_FOLDER`, `PORT`, `GITHUB_TOKEN` and `GITHUB_BASE_URL` from your shell.

## Development

```bash
npm run dev          # compile in watch mode and restart on changes
npm test             # unit and e2e tests
npm run type-check   # type-check without emitting
npm run build        # compile to dist/
npm run clean        # remove dist/
```
