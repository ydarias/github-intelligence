# ui

Web dashboard to explore the issues and PRs served by `api`.

## What it does

`ui` is a React + Vite single-page app. It shows summary stats, charts and filterable tables. It only talks to `api` over REST and imports just types from `@github-intelligence/api-contracts`; filtering and stats are computed by the API, never in the browser.

## Usage

```bash
# Start the API first (or run `npm run dev` from the repo root to start both)
npm run dev
```

Then visit [http://localhost:5173](http://localhost:5173).

### Dev proxy

Vite proxies `/api` to `http://localhost:3001`, where `api` listens by default. If you change the API `PORT`, update the proxy target in `vite.config.ts`.

### Environment variables

None.

## Development

```bash
npm run dev          # start the Vite dev server
npm test             # run the tests
npm run type-check   # type-check without emitting
npm run build        # type-check and build to dist/
npm run clean        # remove dist/
```
