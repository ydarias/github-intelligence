# Spec: Report View — Time-to-Close Percentiles per Repository

## Objective

Add a "Report" top-level view to the reporter app that displays time-to-close trends for issues and PRs, broken down by repository and grouped by ISO week. Each repository gets two line charts (one for issues, one for PRs), each showing p50, p75, p90, and p99 percentiles on the Y-axis over time on the X-axis.

## Navigation

- Add `"report"` to the `View` union type in `App.tsx`.
- Add a "Report" nav button in the header alongside "Issues" and "Members", using the same styling pattern.

## Data Flow

### Server

**New endpoint**: `GET /api/report`

Loads all items from `FlatCacheIssuesRepository` and `FlatCachePullRequestsRepository` (same as `/api/issues`), then:

1. Filters to closed items only (`state === "closed"` and `closedAt !== null`).
2. Groups by `repository`.
3. Within each repository, groups by `type` ("issue" vs "pr").
4. Within each type group, groups by ISO week of `closedAt` (week start = Monday, formatted as `"YYYY-MM-DD"`).
5. For each week bucket, computes time-to-close in hours and derives p50, p75, p90, p99 using the nearest-rank method (same as existing `stats.ts`).

Returns:
```ts
interface ReportResponse {
  repositories: RepositoryReport[];
}

interface RepositoryReport {
  repository: string;
  issues: WeeklyPercentiles[];
  prs: WeeklyPercentiles[];
}

interface WeeklyPercentiles {
  week: string;        // ISO week start date: "YYYY-MM-DD" (Monday)
  p50: number;         // hours
  p75: number;
  p90: number;
  p99: number;
}
```

Weeks with no closed items are omitted (no zero-filling). Results sorted by `week` ascending within each group.

Returns `404` with `{ error: "..." }` if no cached data is found.

**New file**: `apps/reporter/src/server/report-stats.ts` — contains the grouping and percentile computation logic, exported as `computeReport(items: GithubIssue[]): ReportResponse`.

### Client

**New types** added to `apps/reporter/src/client/types.ts`:
- `WeeklyPercentiles`
- `RepositoryReport`
- `ReportResponse`

**New fetch function** in `apps/reporter/src/client/api.ts`:
- `fetchReport(): Promise<ReportResponse>`

## Components

### `PercentilesOverTimeChart`

**File**: `apps/reporter/src/client/components/PercentilesOverTimeChart.tsx`

A Recharts `LineChart` with:
- X-axis: `week` (formatted as short date, e.g. "Jan 06")
- Y-axis: hours (no unit suffix on axis ticks)
- 4 lines: p50, p75, p90, p99 — each a distinct color
- Legend showing the four percentile labels
- Tooltip showing all four values on hover
- `title` prop (e.g. "Issues" or "Pull Requests") rendered above the chart

### `ReportView`

**File**: `apps/reporter/src/client/components/ReportView.tsx`

Renders one section per repository:
- Section heading: repository name
- Two `PercentilesOverTimeChart` side-by-side: Issues on the left, Pull Requests on the right
- If a repository has no closed data for issues or PRs, that chart renders an empty state ("No closed issues" / "No closed pull requests")

### `App.tsx` changes

- Add `"report"` to `View` type.
- Add "Report" nav button.
- On `view === "report"`: fetch from `/api/report` and render `<ReportView />`.
- Loading and error states follow the same pattern as the Issues view.

## Files to Create

| File | Purpose |
|---|---|
| `apps/reporter/src/server/report-stats.ts` | `computeReport()` — grouping + percentile logic |
| `apps/reporter/src/client/components/PercentilesOverTimeChart.tsx` | Recharts line chart for weekly percentiles |
| `apps/reporter/src/client/components/ReportView.tsx` | Layout: one section per repository |

## Files to Modify

| File | Change |
|---|---|
| `apps/reporter/src/server/router.ts` | Add `GET /api/report` route |
| `apps/reporter/src/client/types.ts` | Add `WeeklyPercentiles`, `RepositoryReport`, `ReportResponse` |
| `apps/reporter/src/client/api.ts` | Add `fetchReport()` |
| `apps/reporter/src/client/App.tsx` | Add `"report"` view, nav button, fetch + render |

## Testing Strategy

Unit tests for `computeReport()` in `report-stats.spec.ts`:
- Groups items by repository correctly
- Groups items by type correctly
- Groups by ISO week of `closedAt`
- Computes p50/p75/p90/p99 correctly (nearest-rank)
- Omits open items
- Returns empty arrays for a type with no closed items
- Sorts weeks ascending

No tests for React components (consistent with existing codebase — no component tests exist).

## Boundaries

- Never zero-fill missing weeks — omit them so sparse data stays readable.
- Y-axis unit is hours (consistent with existing `stats.ts`).
- Do not modify the existing `/api/issues` endpoint or any existing stats logic.
- Week start = Monday (ISO 8601), formatted as `"YYYY-MM-DD"`.
