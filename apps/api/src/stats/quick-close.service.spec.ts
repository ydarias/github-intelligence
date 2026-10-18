import type { GithubIssue } from "@github-intelligence/issues";

import { QuickCloseService } from "./quick-close.service.js";

function item(
  id: number,
  createdAt: string,
  closedAt: string | null,
  type: GithubIssue["type"] = "issue",
): GithubIssue {
  return {
    id,
    number: id + 100,
    repository: "o/r",
    title: `Item ${id}`,
    body: null,
    state: closedAt === null ? "open" : "closed",
    createdAt,
    updatedAt: "2026-01-01T00:00:00Z",
    closedAt,
    url: `https://github.com/o/r/issues/${id}`,
    labels: [],
    author: "octocat",
    assignees: [],
    type,
  };
}

describe("QuickCloseService", () => {
  const service = new QuickCloseService();

  it("returns nothing when there are no items", () => {
    expect(service.compute([])).toEqual({ byDay: [], items: [] });
  });

  it("includes an issue closed in less than two hours", () => {
    const result = service.compute([item(1, "2026-01-01T10:00:00Z", "2026-01-01T11:59:59Z")]);

    expect(result.items).toEqual([
      {
        id: 1,
        number: 101,
        repository: "o/r",
        title: "Item 1",
        url: "https://github.com/o/r/issues/1",
      },
    ]);
  });

  it("excludes an issue closed in exactly two hours", () => {
    const result = service.compute([item(1, "2026-01-01T10:00:00Z", "2026-01-01T12:00:00Z")]);

    expect(result).toEqual({ byDay: [], items: [] });
  });

  it("excludes issues that are still open", () => {
    expect(service.compute([item(1, "2026-01-01T10:00:00Z", null)])).toEqual({
      byDay: [],
      items: [],
    });
  });

  it("excludes pull requests", () => {
    const result = service.compute([item(1, "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z", "pr")]);

    expect(result).toEqual({ byDay: [], items: [] });
  });

  it("counts the matching issues by creation day, sorted ascending", () => {
    const result = service.compute([
      item(1, "2026-01-03T10:00:00Z", "2026-01-03T10:30:00Z"),
      item(2, "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z"),
      item(3, "2026-01-03T15:00:00Z", "2026-01-03T15:10:00Z"),
    ]);

    expect(result.byDay).toEqual([
      { date: "2026-01-01", count: 1 },
      { date: "2026-01-03", count: 2 },
    ]);
  });

  it("keeps the input order of the matching items", () => {
    const result = service.compute([
      item(1, "2026-01-03T10:00:00Z", "2026-01-03T10:30:00Z"),
      item(2, "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z"),
    ]);

    expect(result.items.map((i) => i.id)).toEqual([1, 2]);
  });
});
