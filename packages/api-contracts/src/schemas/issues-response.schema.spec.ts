import type { IssuesResponse } from "../types/issues-response.js";

import { issuesResponseSchema } from "./issues-response.schema.js";

const response: IssuesResponse = {
  issues: [
    {
      id: 1,
      number: 1,
      repository: "o/r",
      title: "Fix bug",
      body: "Details",
      state: "open",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
      closedAt: null,
      url: "https://github.com/o/r/issues/1",
      labels: ["bug"],
      author: "alice",
      assignees: ["bob"],
      type: "issue",
    },
  ],
  stats: {
    total: 1,
    open: 1,
    closed: 0,
    totalPRs: 0,
    openPRs: 0,
    closedPRs: 0,
    avgIssuesPerDay: 1,
    avgPRsPerDay: 0,
    timeToClosePercentiles: null,
    timeToCloseByMonth: [],
    byAuthor: [{ login: "alice", name: "Alice", total: 1, open: 1, closed: 0, percentage: 100 }],
    byDay: [{ date: "2026-01-01", issues: 1, prs: 0 }],
  },
  total: 1,
  filterOptions: { authors: ["alice"], assignees: ["bob"], labels: ["bug"], repositories: ["o/r"] },
};

describe("issuesResponseSchema", () => {
  it("parses a realistic response unchanged, without stripping any field", () => {
    expect(issuesResponseSchema.parse(response)).toEqual(response);
  });

  it("accepts empty filter options", () => {
    const empty = {
      ...response,
      filterOptions: { authors: [], assignees: [], labels: [], repositories: [] },
    };

    expect(issuesResponseSchema.parse(empty)).toEqual(empty);
  });

  it("rejects a response without filterOptions", () => {
    const incomplete: Partial<IssuesResponse> = { ...response };
    delete incomplete.filterOptions;

    expect(issuesResponseSchema.safeParse(incomplete).success).toBe(false);
  });
});
