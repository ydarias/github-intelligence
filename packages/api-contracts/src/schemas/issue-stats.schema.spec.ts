import type { IssueStats } from "../types/issue-stats.js";

import { issueStatsSchema } from "./issue-stats.schema.js";

const stats: IssueStats = {
  total: 2,
  open: 1,
  closed: 1,
  totalPRs: 1,
  openPRs: 0,
  closedPRs: 1,
  avgIssuesPerDay: 0.5,
  avgPRsPerDay: 0.25,
  timeToClosePercentiles: { p50: 24, p75: 48, p90: 72, p99: 96 },
  timeToCloseByMonth: [{ month: "2026-01", p50: 24, p75: 48, p90: 72, p99: 96 }],
  byAuthor: [{ login: "alice", name: null, total: 3, open: 1, closed: 2, percentage: 100 }],
  byDay: [{ date: "2026-01-01", issues: 2, prs: 1 }],
};

describe("issueStatsSchema", () => {
  it("parses stats unchanged, without stripping any field", () => {
    expect(issueStatsSchema.parse(stats)).toEqual(stats);
  });

  it("accepts null time-to-close percentiles", () => {
    const empty = { ...stats, timeToClosePercentiles: null, timeToCloseByMonth: [] };

    expect(issueStatsSchema.parse(empty)).toEqual(empty);
  });

  it("rejects stats without byAuthor", () => {
    const incomplete: Partial<IssueStats> = { ...stats };
    delete incomplete.byAuthor;

    expect(issueStatsSchema.safeParse(incomplete).success).toBe(false);
  });

  it("lists exactly the fields computeStats returns plus byAuthor", () => {
    expect(Object.keys(issueStatsSchema.shape).sort()).toEqual(
      [
        "total",
        "open",
        "closed",
        "totalPRs",
        "openPRs",
        "closedPRs",
        "avgIssuesPerDay",
        "avgPRsPerDay",
        "timeToClosePercentiles",
        "timeToCloseByMonth",
        "byDay",
        "byAuthor",
      ].sort(),
    );
  });
});
