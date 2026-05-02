# Implementation Plan: Report View — Time-to-Close Percentiles

## Overview

Add a "Report" top-level view to the reporter app. For each repository in the cache, it displays two line charts (Issues | Pull Requests) showing p50/p75/p90/p99 time-to-close (hours) grouped by ISO week.

## Architecture Decisions

- **Server-side computation**: `computeReport()` lives in `report-stats.ts`, mirroring `stats.ts`. The client gets pre-computed data and only renders.
- **Week key = Monday date as "YYYY-MM-DD"**: Recharts-friendly, sortable as a string, no extra library needed.
- **No zero-fill**: weeks with no closed items are omitted — sparse data stays clean.
- **New endpoint `GET /api/report`**: keeps concerns separate from `/api/issues`.

## Dependency Graph

```
GithubIssue (existing — has .repository, .type, .state, .closedAt, .createdAt)
        │
        ├── report-stats.ts (computeReport) ← pure function, testable in isolation
        │       │
        │       └── router.ts GET /api/report ← HTTP wrapper around computeReport
        │               │
        │               └── api.ts fetchReport() ← client fetch
        │                       │
        │                       └── PercentilesOverTimeChart ← Recharts line chart
        │                               │
        │                               └── ReportView ← one section per repo
        │                                       │
        │                                       └── App.tsx ← nav + view switch
        │
        └── types.ts (WeeklyPercentiles, RepositoryReport, ReportResponse)
            shared by server and client
```

## Tasks

### Phase 1: Server Logic

#### Task 1 — `computeReport()` server-side logic

**Description:** Create `apps/reporter/src/server/report-stats.ts` with a pure `computeReport(items)` function. Groups closed items by repository → type → ISO week, then computes p50/p75/p90/p99 time-to-close (hours) per week bucket using the same nearest-rank method as `stats.ts`.

**Acceptance criteria:**
- [ ] `computeReport([])` returns `{ repositories: [] }`
- [ ] Items grouped correctly by `repository` field
- [ ] Items grouped by `type` into `issues` and `prs` arrays
- [ ] Open items (state !== "closed") are excluded
- [ ] Items with `closedAt === null` are excluded
- [ ] Week key = ISO Monday date ("YYYY-MM-DD") of `closedAt`
- [ ] p50/p75/p90/p99 computed via nearest-rank on sorted hours array
- [ ] `WeeklyPercentiles[]` sorted ascending by `week`

**Verification:**
- [ ] `npm test -- --testPathPattern report-stats` — all cases pass
- [ ] `npm run build` from `apps/reporter` succeeds

**Dependencies:** None

**Files:**
- `apps/reporter/src/server/report-stats.ts` (create)
- `apps/reporter/src/server/report-stats.spec.ts` (create)

**Scope:** S

---

#### Task 2 — `GET /api/report` endpoint

**Description:** Add the `/api/report` route to `router.ts`. Loads all items from both flat-cache repositories, calls `computeReport()`, and returns the result as JSON. Returns 404 if no cached data is found.

**Acceptance criteria:**
- [ ] `GET /api/report` returns `200` with `{ repositories: [...] }` when cache has data
- [ ] `GET /api/report` returns `404` with `{ error: "..." }` when cache is empty
- [ ] Route follows the same repository instantiation pattern as `/api/issues`

**Verification:**
- [ ] `npm run build` from `apps/reporter` succeeds
- [ ] Manual: start dev server, `curl http://localhost:3001/api/report` returns valid JSON

**Dependencies:** Task 1

**Files:**
- `apps/reporter/src/server/router.ts` (modify)

**Scope:** XS

---

### Checkpoint 1
- [ ] `npm run build` from repo root succeeds
- [ ] `npm test -- --testPathPattern report-stats` — all pass

---

### Phase 2: Client Wiring

#### Task 3 — Client types and `fetchReport()`

**Description:** Add `WeeklyPercentiles`, `RepositoryReport`, and `ReportResponse` to `types.ts`. Add `fetchReport()` to `api.ts` following the same error-handling pattern as `fetchIssues()`.

**Acceptance criteria:**
- [ ] `WeeklyPercentiles`, `RepositoryReport`, `ReportResponse` exported from `types.ts`
- [ ] `fetchReport()` throws on non-OK response (same pattern as `fetchIssues`)
- [ ] TypeScript compiles with no errors

**Verification:**
- [ ] `npm run build` from `apps/reporter` succeeds with zero type errors

**Dependencies:** Task 2

**Files:**
- `apps/reporter/src/client/types.ts` (modify)
- `apps/reporter/src/client/api.ts` (modify)

**Scope:** S

---

### Checkpoint 2
- [ ] `npm run build` from `apps/reporter` succeeds cleanly

---

### Phase 3: UI Components

#### Task 4 — `PercentilesOverTimeChart` component

**Description:** Create a Recharts `LineChart` with four lines (p50, p75, p90, p99), X-axis showing week dates, Y-axis in hours. Styled consistently with `IssuesOverTimeChart` (same oklch colors, same border/panel pattern). Accepts a `title` prop rendered as a label above the chart, and a `data: WeeklyPercentiles[]` prop. Renders an empty-state message when `data` is empty.

**Acceptance criteria:**
- [ ] Renders four `Line` elements with distinct colors
- [ ] X-axis `dataKey="week"`, Y-axis shows numeric hour values
- [ ] `title` prop rendered as uppercase tracking-widest label (matching existing chart style)
- [ ] Empty `data` renders a text message instead of the chart
- [ ] No dots on lines (consistent with existing chart)

**Verification:**
- [ ] `npm run build` from `apps/reporter` succeeds
- [ ] Visual check in dev server once Task 5 wires it up

**Dependencies:** Task 3

**Files:**
- `apps/reporter/src/client/components/PercentilesOverTimeChart.tsx` (create)

**Scope:** S

---

#### Task 5 — `ReportView` + navigation wiring

**Description:** Create `ReportView` component that maps over `RepositoryReport[]` and renders a section per repository with two `PercentilesOverTimeChart` side-by-side. Wire it into `App.tsx`: add `"report"` to the `View` type, add "Report" nav button, fetch from `/api/report` on mount (when view is active), and render loading/error/success states.

**Acceptance criteria:**
- [ ] "Report" nav button appears in the header alongside "Issues" and "Members"
- [ ] Clicking "Report" navigates to the report view
- [ ] One section per repository, with repository name as heading
- [ ] Each section has two charts side-by-side: "Issues" on the left, "Pull Requests" on the right
- [ ] Charts with no data show the empty-state message
- [ ] Loading and error states follow the same pattern as the Issues view

**Verification:**
- [ ] `npm run build` from root succeeds
- [ ] Dev server: navigate to Report, verify sections and charts render
- [ ] Dev server: verify Issues and Members views still work (no regressions)

**Dependencies:** Task 4

**Files:**
- `apps/reporter/src/client/components/ReportView.tsx` (create)
- `apps/reporter/src/client/App.tsx` (modify)

**Scope:** M

---

### Checkpoint 3 (Final)
- [ ] `npm run build` from repo root — zero errors
- [ ] `npm test` — all existing tests pass
- [ ] Dev server: "Report" link navigates to report view
- [ ] Report shows one section per repo with two charts (issues + PRs)
- [ ] Charts display four percentile lines over weekly X-axis
- [ ] Issues and Members views unaffected

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Cache has no closed items | Low | Empty state handled per chart |
| Recharts color contrast in light theme | Low | Use oklch colors consistent with `IssuesOverTimeChart` |
| ISO week Monday calculation off-by-one | Medium | Unit tests cover week boundary cases |
