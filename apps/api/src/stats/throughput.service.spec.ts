import type { GithubIssue } from "@github-intelligence/issues";

import { ThroughputService } from "./throughput.service.js";

function closed(id: number, type: GithubIssue["type"], closedAt: string | null): GithubIssue {
  return {
    id,
    number: id,
    repository: "o/r",
    title: `Item ${id}`,
    body: null,
    state: closedAt === null ? "open" : "closed",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    closedAt,
    url: `https://github.com/o/r/issues/${id}`,
    labels: [],
    author: "octocat",
    assignees: [],
    type,
  };
}

describe("ThroughputService", () => {
  const service = new ThroughputService();

  it("returns no weeks when there are no items", () => {
    expect(service.compute([])).toEqual({ byWeek: [] });
  });

  it("excludes items that are not closed", () => {
    expect(service.compute([closed(1, "issue", null)])).toEqual({ byWeek: [] });
  });

  it("groups items closed in the same Monday-based week", () => {
    // 2026-01-05 is a Monday, 2026-01-11 the Sunday that ends that week.
    const result = service.compute([
      closed(1, "issue", "2026-01-05T00:00:00Z"),
      closed(2, "issue", "2026-01-11T23:59:59Z"),
    ]);

    expect(result.byWeek).toHaveLength(1);
    expect(result.byWeek[0]?.week).toBe("2026-01-05");
  });

  it("starts the next week on the following Monday", () => {
    const result = service.compute([
      closed(1, "issue", "2026-01-11T23:59:59Z"),
      closed(2, "issue", "2026-01-12T00:00:00Z"),
    ]);

    expect(result.byWeek.map((w) => w.week)).toEqual(["2026-01-05", "2026-01-12"]);
  });

  it("counts issues and pull requests separately", () => {
    const result = service.compute([
      closed(1, "issue", "2026-01-06T10:00:00Z"),
      closed(2, "issue", "2026-01-07T10:00:00Z"),
      closed(3, "pr", "2026-01-08T10:00:00Z"),
    ]);

    expect(result.byWeek[0]).toMatchObject({ issues: 2, prs: 1 });
  });

  it("lists the items of a week sorted by type, issues before pull requests", () => {
    const result = service.compute([
      closed(1, "pr", "2026-01-06T10:00:00Z"),
      closed(2, "issue", "2026-01-07T10:00:00Z"),
    ]);

    expect(result.byWeek[0]?.items).toEqual([
      {
        id: 2,
        title: "Item 2",
        url: "https://github.com/o/r/issues/2",
        repository: "o/r",
        type: "issue",
      },
      {
        id: 1,
        title: "Item 1",
        url: "https://github.com/o/r/issues/1",
        repository: "o/r",
        type: "pr",
      },
    ]);
  });

  it("orders weeks ascending regardless of input order", () => {
    const result = service.compute([
      closed(1, "issue", "2026-02-02T10:00:00Z"),
      closed(2, "issue", "2026-01-05T10:00:00Z"),
      closed(3, "issue", "2026-01-19T10:00:00Z"),
    ]);

    expect(result.byWeek.map((w) => w.week)).toEqual(["2026-01-05", "2026-01-19", "2026-02-02"]);
  });

  it("only exposes the throughput fields of each item", () => {
    const result = service.compute([closed(1, "issue", "2026-01-06T10:00:00Z")]);

    expect(Object.keys(result.byWeek[0]?.items[0] ?? {}).sort()).toEqual([
      "id",
      "repository",
      "title",
      "type",
      "url",
    ]);
  });
});
