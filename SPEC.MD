# Spec: Monthly Time-to-Close Breakdown

## Objective

In the Issues view, let users expand a monthly breakdown of time-to-close percentiles directly inside the `StatsSummary` component. The breakdown is hidden by default and toggled by a button. It reacts to all active filters.

## Target users

Anyone using the reporter app to understand issue/PR resolution speed trends over time.

---

## Behaviour

### Toggle button

- Placed inside `StatsSummary`, immediately after the existing "Time to Close" percentile row.
- Label: "Show monthly breakdown" / "Hide monthly breakdown".
- Default state: collapsed (breakdown hidden).
- Rendered only when there is at least one closed item in the filtered dataset.

### Monthly breakdown table

When expanded, renders a table with one row per calendar month that has at least one closed item in the current filtered dataset.

| Month   | p50 | p75 | p90 | p99 |
| ------- | --- | --- | --- | --- |
| 2025-04 | 2d  | 5d  | 12d | 30d |
| 2025-03 | 1d  | 3d  | 8d  | 20d |

- Months sorted most-recent first.
- Values formatted with the same helper used for the aggregate percentiles (hours → `Xh`, days → `Xd`).
- Months with no closed items are omitted.

### Filter reactivity

The table recomputes whenever the filters in `SearchForm` change (type, state, author, assignee, labels), because it draws from the same `IssuesResponse.stats` object already fetched by `App.tsx` — no additional requests.

---

## Data flow

### Server — `stats.ts`

Add `computeTimeToCloseByMonth(items: GithubIssue[]): MonthlyTimeToClose[]`:

1. Filter to `state === "closed" && closedAt !== null`.
2. Group by `closedAt.slice(0, 7)` (→ `YYYY-MM`).
3. For each group, sort time-to-close hours ascending and apply `nearestRankPercentile` for p50/p75/p90/p99.
4. Return array sorted descending by month string (most recent first).

Call it inside `computeStats` and include the result in `IssueStats`.

### Types

Add to both `apps/reporter/src/server/stats.ts` (server) and `apps/reporter/src/client/types.ts` (client DTO):

```typescript
export interface MonthlyTimeToClose {
  month: string; // "YYYY-MM"
  p50: number; // hours
  p75: number;
  p90: number;
  p99: number;
}
```

Extend `IssueStats`:

```typescript
timeToCloseByMonth: MonthlyTimeToClose[];   // [] when no closed items
```

No new API endpoint — the data rides in the existing `GET /api/issues` response.

---

## Component changes

### `StatsSummary.tsx`

- Accept `timeToCloseByMonth: MonthlyTimeToClose[]` as a prop.
- Local `useState<boolean>` for expanded/collapsed.
- Render toggle button only when `timeToCloseByMonth.length > 0`.
- Render table below the button when expanded.

### `App.tsx`

- Pass `stats.timeToCloseByMonth` down to `StatsSummary`.

---

## Files touched

```
apps/reporter/src/
  server/
    stats.ts          ← add MonthlyTimeToClose interface + computation, extend IssueStats
  client/
    types.ts          ← add MonthlyTimeToClose, extend IssueStats
    components/
      StatsSummary.tsx  ← toggle button + breakdown table
```

No new files required.

---

## Testing strategy

Unit-test `computeTimeToCloseByMonth` in `stats.ts`:

- Returns `[]` when no closed items.
- Groups correctly by month (items from different months stay separate).
- Sorts most-recent month first.
- Omits months with no closed items.
- Percentile values match `nearestRankPercentile` applied to that month's hours.

No UI tests for the toggle (trivial local state).

---

## Boundaries

- **Always:** use the same filtered item set already passed to `computeStats` — no extra fetch, no new endpoint.
- **Never:** alter the existing aggregate `timeToClosePercentiles` field or its display.
- **Out of scope:** charts, CSV export, pagination of the monthly table.
