# Task List: Monthly Time-to-Close Breakdown

## Task 1 — Server

- [ ] Add `MonthlyTimeToClose` interface to `stats.ts`
- [ ] Implement `computeTimeToCloseByMonth()` in `stats.ts`
- [ ] Extend `IssueStats` with `timeToCloseByMonth` and wire into `computeStats()`
- [ ] Write `stats.spec.ts` with all test cases
- [ ] **CHECKPOINT A** — `npm test` green; `npm run build` clean

## Task 2 — Client

- [ ] Add `MonthlyTimeToClose` + extend `IssueStats` in `types.ts`
- [ ] Pass `timeToCloseByMonth` prop from `App.tsx` to `StatsSummary`
- [ ] Add toggle button + breakdown table in `StatsSummary.tsx`
- [ ] **CHECKPOINT B (FINAL)** — manual smoke test per plan
