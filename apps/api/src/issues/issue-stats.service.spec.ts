import type { GithubIssue, OrgMember } from "@github-intelligence/api-contracts";

import { IssueOriginsService } from "./issue-origins.service.js";
import { IssueStatsService } from "./issue-stats.service.js";

function makeIssue(overrides: Partial<GithubIssue> & { id: number }): GithubIssue {
  return {
    id: overrides.id,
    number: overrides.id,
    repository: overrides.repository ?? "owner/repo",
    title: `Issue ${overrides.id}`,
    body: null,
    state: overrides.state ?? "open",
    createdAt: overrides.createdAt ?? "2024-01-01T00:00:00Z",
    updatedAt: overrides.updatedAt ?? "2024-01-01T00:00:00Z",
    closedAt: overrides.closedAt !== undefined ? overrides.closedAt : null,
    url: `https://github.com/owner/repo/issues/${overrides.id}`,
    labels: [],
    author: "user",
    assignees: [],
    type: overrides.type ?? "issue",
  };
}

describe("IssueStatsService.computeTimeToCloseByMonth", () => {
  const service = new IssueStatsService(new IssueOriginsService());

  it("returns [] for empty input", () => {
    expect(service.computeTimeToCloseByMonth([])).toEqual([]);
  });

  it("returns [] when all items are open", () => {
    const items = [
      makeIssue({ id: 1, state: "open", closedAt: null }),
      makeIssue({ id: 2, state: "open", closedAt: null }),
    ];
    expect(service.computeTimeToCloseByMonth(items)).toEqual([]);
  });

  it("returns one entry for a single closed item", () => {
    const items = [
      makeIssue({
        id: 1,
        state: "closed",
        createdAt: "2024-03-01T00:00:00Z",
        closedAt: "2024-03-03T00:00:00Z", // 48h cycle
      }),
    ];
    const result = service.computeTimeToCloseByMonth(items);
    expect(result).toHaveLength(1);
    expect(result[0]!.month).toBe("2024-03");
    expect(result[0]!.p50).toBe(48);
    expect(result[0]!.p75).toBe(48);
    expect(result[0]!.p90).toBe(48);
    expect(result[0]!.p99).toBe(48);
  });

  it("groups items into separate months", () => {
    const items = [
      makeIssue({
        id: 1,
        state: "closed",
        createdAt: "2024-02-01T00:00:00Z",
        closedAt: "2024-02-02T00:00:00Z",
      }),
      makeIssue({
        id: 2,
        state: "closed",
        createdAt: "2024-03-01T00:00:00Z",
        closedAt: "2024-03-02T00:00:00Z",
      }),
    ];
    const result = service.computeTimeToCloseByMonth(items);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.month)).toEqual(["2024-03", "2024-02"]);
  });

  it("sorts most-recent month first", () => {
    const items = [
      makeIssue({
        id: 1,
        state: "closed",
        createdAt: "2024-01-01T00:00:00Z",
        closedAt: "2024-01-02T00:00:00Z",
      }),
      makeIssue({
        id: 2,
        state: "closed",
        createdAt: "2024-03-01T00:00:00Z",
        closedAt: "2024-03-02T00:00:00Z",
      }),
      makeIssue({
        id: 3,
        state: "closed",
        createdAt: "2024-02-01T00:00:00Z",
        closedAt: "2024-02-02T00:00:00Z",
      }),
    ];
    const result = service.computeTimeToCloseByMonth(items);
    expect(result.map((r) => r.month)).toEqual(["2024-03", "2024-02", "2024-01"]);
  });

  it("groups multiple items in the same month into one entry", () => {
    const items = [
      makeIssue({
        id: 1,
        state: "closed",
        createdAt: "2024-03-01T00:00:00Z",
        closedAt: "2024-03-02T00:00:00Z",
      }), // 24h
      makeIssue({
        id: 2,
        state: "closed",
        createdAt: "2024-03-05T00:00:00Z",
        closedAt: "2024-03-07T00:00:00Z",
      }), // 48h
    ];
    const result = service.computeTimeToCloseByMonth(items);
    expect(result).toHaveLength(1);
    expect(result[0]!.month).toBe("2024-03");
    // sorted: [24, 48] → p50 = nearest rank ceil(0.5*2)=1 → 24h
    expect(result[0]!.p50).toBe(24);
    expect(result[0]!.p99).toBe(48);
  });

  it("uses closedAt month, not createdAt month, to group", () => {
    // Created in Jan, closed in Feb
    const items = [
      makeIssue({
        id: 1,
        state: "closed",
        createdAt: "2024-01-28T00:00:00Z",
        closedAt: "2024-02-01T00:00:00Z",
      }),
    ];
    const result = service.computeTimeToCloseByMonth(items);
    expect(result[0]!.month).toBe("2024-02");
  });
});

describe("IssueStatsService.compute", () => {
  const service = new IssueStatsService(new IssueOriginsService());
  const member: OrgMember = {
    id: 1,
    login: "user",
    name: "The User",
    email: null,
    createdAt: "2024-01-01T00:00:00Z",
    talentId: null,
    jobRole: null,
  };

  it("counts issues and pull requests separately", () => {
    const items = [
      makeIssue({ id: 1, type: "issue", state: "open" }),
      makeIssue({ id: 2, type: "issue", state: "closed", closedAt: "2024-01-02T00:00:00Z" }),
      makeIssue({ id: 3, type: "pr", state: "closed", closedAt: "2024-01-02T00:00:00Z" }),
    ];

    expect(service.compute(items, [])).toMatchObject({
      total: 2,
      open: 1,
      closed: 1,
      totalPRs: 1,
      openPRs: 0,
      closedPRs: 1,
    });
  });

  it("averages over the calendar days between the first and the last creation date", () => {
    const items = [
      makeIssue({ id: 1, type: "issue", createdAt: "2024-01-01T10:00:00Z" }),
      makeIssue({ id: 2, type: "issue", createdAt: "2024-01-02T10:00:00Z" }),
      makeIssue({ id: 3, type: "pr", createdAt: "2024-01-04T10:00:00Z" }),
    ];

    const stats = service.compute(items, []);

    expect(stats.avgIssuesPerDay).toBe(0.5);
    expect(stats.avgPRsPerDay).toBe(0.25);
  });

  it("computes the time to close percentiles over all closed items", () => {
    const items = [
      makeIssue({
        id: 1,
        state: "closed",
        createdAt: "2024-01-01T00:00:00Z",
        closedAt: "2024-01-02T00:00:00Z",
      }),
      makeIssue({ id: 2, state: "open" }),
    ];

    expect(service.compute(items, []).timeToClosePercentiles).toEqual({
      p50: 24,
      p75: 24,
      p90: 24,
      p99: 24,
    });
  });

  it("returns null percentiles when nothing is closed", () => {
    expect(service.compute([makeIssue({ id: 1 })], []).timeToClosePercentiles).toBeNull();
  });

  it("groups creations by day, oldest first", () => {
    const items = [
      makeIssue({ id: 1, type: "issue", createdAt: "2024-01-02T10:00:00Z" }),
      makeIssue({ id: 2, type: "pr", createdAt: "2024-01-01T10:00:00Z" }),
      makeIssue({ id: 3, type: "issue", createdAt: "2024-01-02T11:00:00Z" }),
    ];

    expect(service.compute(items, []).byDay).toEqual([
      { date: "2024-01-01", issues: 0, prs: 1 },
      { date: "2024-01-02", issues: 2, prs: 0 },
    ]);
  });

  it("adds the issue origins joined with the members", () => {
    const stats = service.compute([makeIssue({ id: 1 })], [member]);

    expect(stats.byAuthor).toEqual([
      { login: "user", name: "The User", total: 1, open: 1, closed: 0, percentage: 100 },
    ]);
  });
});
