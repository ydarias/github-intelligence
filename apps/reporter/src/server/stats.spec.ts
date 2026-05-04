import type { GithubIssue } from "@github-intelligence/issues-collector";

import { computeTimeToCloseByMonth } from "./stats.js";

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

describe("computeTimeToCloseByMonth", () => {
  it("returns [] for empty input", () => {
    expect(computeTimeToCloseByMonth([])).toEqual([]);
  });

  it("returns [] when all items are open", () => {
    const items = [
      makeIssue({ id: 1, state: "open", closedAt: null }),
      makeIssue({ id: 2, state: "open", closedAt: null }),
    ];
    expect(computeTimeToCloseByMonth(items)).toEqual([]);
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
    const result = computeTimeToCloseByMonth(items);
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
    const result = computeTimeToCloseByMonth(items);
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
    const result = computeTimeToCloseByMonth(items);
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
    const result = computeTimeToCloseByMonth(items);
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
    const result = computeTimeToCloseByMonth(items);
    expect(result[0]!.month).toBe("2024-02");
  });
});
