import type { GithubIssue } from "@github-intelligence/issues-collector";

import { computeReport } from "./report-stats.js";

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

describe("computeReport", () => {
  const today = "2024-01-10";

  it("returns empty repositories for empty input", () => {
    expect(computeReport([], today)).toEqual({ repositories: [] });
  });

  it("groups items by repository", () => {
    const items = [
      makeIssue({ id: 1, repository: "owner/repo-a", createdAt: "2024-01-01T00:00:00Z", closedAt: "2024-01-02T00:00:00Z" }),
      makeIssue({ id: 2, repository: "owner/repo-b", createdAt: "2024-01-01T00:00:00Z", closedAt: "2024-01-02T00:00:00Z" }),
    ];
    const result = computeReport(items, today);
    expect(result.repositories).toHaveLength(2);
    expect(result.repositories.map((r) => r.repository)).toEqual(
      expect.arrayContaining(["owner/repo-a", "owner/repo-b"]),
    );
  });

  it("counts item as open on createdAt day but not on closedAt day", () => {
    // Created Jan 1, closed Jan 3 → open on Jan 1, Jan 2 only
    const items = [
      makeIssue({ id: 1, type: "issue", createdAt: "2024-01-01T00:00:00Z", closedAt: "2024-01-03T00:00:00Z" }),
    ];
    const result = computeReport(items, "2024-01-03");
    const byDay = result.repositories[0]!.byDay;
    expect(byDay.find((d) => d.date === "2024-01-01")!.issues).toBe(1);
    expect(byDay.find((d) => d.date === "2024-01-02")!.issues).toBe(1);
    expect(byDay.find((d) => d.date === "2024-01-03")!.issues).toBe(0);
  });

  it("counts open items (no closedAt) through today", () => {
    const items = [
      makeIssue({ id: 1, type: "issue", createdAt: "2024-01-01T00:00:00Z", closedAt: null }),
    ];
    const result = computeReport(items, "2024-01-03");
    const byDay = result.repositories[0]!.byDay;
    expect(byDay).toHaveLength(3);
    expect(byDay.every((d) => d.issues === 1)).toBe(true);
  });

  it("counts issues and PRs independently per day", () => {
    const items = [
      makeIssue({ id: 1, type: "issue", createdAt: "2024-01-01T00:00:00Z", closedAt: "2024-01-03T00:00:00Z" }),
      makeIssue({ id: 2, type: "pr",    createdAt: "2024-01-01T00:00:00Z", closedAt: "2024-01-02T00:00:00Z" }),
    ];
    const result = computeReport(items, "2024-01-03");
    const byDay = result.repositories[0]!.byDay;
    expect(byDay.find((d) => d.date === "2024-01-01")).toEqual({ date: "2024-01-01", issues: 1, prs: 1 });
    expect(byDay.find((d) => d.date === "2024-01-02")).toEqual({ date: "2024-01-02", issues: 1, prs: 0 });
    expect(byDay.find((d) => d.date === "2024-01-03")).toEqual({ date: "2024-01-03", issues: 0, prs: 0 });
  });

  it("accumulates multiple items open on the same day", () => {
    const items = [
      makeIssue({ id: 1, type: "issue", createdAt: "2024-01-01T00:00:00Z", closedAt: "2024-01-05T00:00:00Z" }),
      makeIssue({ id: 2, type: "issue", createdAt: "2024-01-02T00:00:00Z", closedAt: "2024-01-05T00:00:00Z" }),
    ];
    const result = computeReport(items, "2024-01-05");
    const byDay = result.repositories[0]!.byDay;
    expect(byDay.find((d) => d.date === "2024-01-01")!.issues).toBe(1);
    expect(byDay.find((d) => d.date === "2024-01-02")!.issues).toBe(2);
    expect(byDay.find((d) => d.date === "2024-01-03")!.issues).toBe(2);
    expect(byDay.find((d) => d.date === "2024-01-05")!.issues).toBe(0);
  });

  it("produces a continuous day range from first createdAt to today", () => {
    const items = [
      makeIssue({ id: 1, createdAt: "2024-01-01T00:00:00Z", closedAt: "2024-01-02T00:00:00Z" }),
    ];
    const result = computeReport(items, "2024-01-05");
    const dates = result.repositories[0]!.byDay.map((d) => d.date);
    expect(dates).toEqual(["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"]);
  });

  it("days are sorted ascending", () => {
    const items = [
      makeIssue({ id: 1, createdAt: "2024-01-03T00:00:00Z", closedAt: "2024-01-05T00:00:00Z" }),
    ];
    const result = computeReport(items, "2024-01-05");
    const dates = result.repositories[0]!.byDay.map((d) => d.date);
    expect(dates).toEqual(["2024-01-03", "2024-01-04", "2024-01-05"]);
  });
});
