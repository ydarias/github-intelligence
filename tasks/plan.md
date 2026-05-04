# Plan: Monthly Time-to-Close Breakdown

## Overview

Extend the Issues view so the `StatsSummary` component can expand a monthly breakdown of time-to-close percentiles (p50/p75/p90/p99). The data rides in the existing `/api/issues` response — no new endpoint. The breakdown reflects whichever filters are active.

## Dependency graph

```
GithubIssue (existing — has .state, .closedAt, .createdAt)
        │
        ├── stats.ts: computeTimeToCloseByMonth()  ← pure function, testable alone
        │       extends IssueStats with timeToCloseByMonth[]
        │               │
        │               └── /api/issues already returns IssueStats
        │                       │
        │                       └── types.ts: MonthlyTimeToClose + IssueStats
        │                               │
        │                               └── App.tsx: pass prop to StatsSummary
        │                                       │
        │                                       └── StatsSummary.tsx: toggle + table
```

Task 1 is fully self-contained. Task 2 depends on Task 1.

---

## Task 1 — Server: monthly computation + types + tests

**Files:**

- `apps/reporter/src/server/stats.ts` (modify)
- `apps/reporter/src/server/stats.spec.ts` (create)

**Changes to `stats.ts`:**

1. Add `MonthlyTimeToClose` interface: `{ month: string; p50: number; p75: number; p90: number; p99: number }` (hours).
2. Add `computeTimeToCloseByMonth(items: GithubIssue[]): MonthlyTimeToClose[]`:
   - Filter to `state === "closed" && closedAt !== null`.
   - Group by `closedAt.slice(0, 7)` (`YYYY-MM`).
   - Per group: sort hours ascending, apply `nearestRankPercentile` for p50/p75/p90/p99.
   - Return sorted descending by month string (most recent first).
3. Extend `IssueStats` with `timeToCloseByMonth: MonthlyTimeToClose[]`.
4. Call inside `computeStats`, include in returned object.

**Test cases for `stats.spec.ts`:**

- Empty input → `[]`
- All open items → `[]`
- Single closed item → one entry with correct percentile
- Items in two different months → two entries, most-recent first
- Multiple items in same month → one entry (correctly grouped)
- Percentile values match `nearestRankPercentile` applied to that month's hours

**Acceptance criteria:**

- All new tests pass.
- `GET /api/issues` response JSON includes `stats.timeToCloseByMonth` as an array.
- Existing `timeToClosePercentiles` field and all other stats are unchanged.

---

## Checkpoint A

```
npm test         # inside apps/reporter — all tests green
npm run build    # from repo root — zero type errors
```

---

## Task 2 — Client: types + wiring + UI

**Files:**

- `apps/reporter/src/client/types.ts` (modify)
- `apps/reporter/src/client/App.tsx` (modify)
- `apps/reporter/src/client/components/StatsSummary.tsx` (modify)

**`types.ts`:**

- Add `MonthlyTimeToClose` interface (mirrors server).
- Add `timeToCloseByMonth: MonthlyTimeToClose[]` to `IssueStats`.

**`App.tsx`:**

- Pass `stats.timeToCloseByMonth` as a prop to `<StatsSummary>`.

**`StatsSummary.tsx`:**

- Accept `timeToCloseByMonth: MonthlyTimeToClose[]` prop.
- Add `const [expanded, setExpanded] = useState(false)`.
- Below the "Time to close" percentile grid, render:
  - Toggle button only when `timeToCloseByMonth.length > 0`. Label: "Show monthly breakdown" / "Hide monthly breakdown".
  - When `expanded`: table with columns Month | P50 | P75 | P90 | P99, values via existing `formatHours`.

**Acceptance criteria:**

- Button absent when no closed items in the current filtered dataset.
- Button present when at least one closed item exists.
- Clicking toggles table visibility.
- Table rows are most-recent month first.
- Changing a filter (e.g. type = issue only) updates the table immediately (no reload).
- `formatHours` applied: e.g. 36h → "1.5d", 12h → "12h".

---

## Checkpoint B (Final)

Manual smoke test:

1. Load Issues view with data present.
2. Confirm toggle button visible below the percentile cards.
3. Click — table expands showing months and p50/p75/p90/p99.
4. Click again — table collapses.
5. Change a filter — table reflects the new filtered dataset.
6. Set filters so no closed items exist — button disappears.
