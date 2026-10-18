import type { GithubIssue } from "@github-intelligence/issues";

import { CycleTimeService } from "./cycle-time.service.js";

function item(id: number, createdAt: string, closedAt: string | null): GithubIssue {
  return {
    id,
    number: id,
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
    type: "issue",
  };
}

describe("CycleTimeService", () => {
  const service = new CycleTimeService();

  it("returns no items when there are no items", () => {
    expect(service.compute([])).toEqual({ items: [] });
  });

  it("excludes items that are not closed", () => {
    expect(service.compute([item(1, "2026-01-01T00:00:00Z", null)])).toEqual({ items: [] });
  });

  it("computes the cycle time in whole days from creation to closing", () => {
    const result = service.compute([item(1, "2026-01-01T00:00:00Z", "2026-01-06T00:00:00Z")]);

    expect(result.items[0]?.cycleDays).toBe(5);
  });

  it("rounds the cycle time down to whole days", () => {
    const result = service.compute([item(1, "2026-01-01T12:00:00Z", "2026-01-03T06:00:00Z")]);

    expect(result.items[0]?.cycleDays).toBe(1);
  });

  it("gives a cycle time of zero to an item closed the same day", () => {
    const result = service.compute([item(1, "2026-01-01T08:00:00Z", "2026-01-01T09:00:00Z")]);

    expect(result.items[0]?.cycleDays).toBe(0);
  });

  it("exposes the close date without the time", () => {
    const result = service.compute([item(1, "2026-01-01T00:00:00Z", "2026-01-06T23:59:59Z")]);

    expect(result.items[0]?.closeDate).toBe("2026-01-06");
  });

  it("sorts the items by close date ascending", () => {
    const result = service.compute([
      item(1, "2026-01-01T00:00:00Z", "2026-01-09T00:00:00Z"),
      item(2, "2026-01-01T00:00:00Z", "2026-01-03T00:00:00Z"),
      item(3, "2026-01-01T00:00:00Z", "2026-01-05T00:00:00Z"),
    ]);

    expect(result.items.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  it("only exposes the cycle time fields of each item", () => {
    const result = service.compute([item(1, "2026-01-01T00:00:00Z", "2026-01-06T00:00:00Z")]);

    expect(result.items[0]).toEqual({
      id: 1,
      title: "Item 1",
      url: "https://github.com/o/r/issues/1",
      repository: "o/r",
      type: "issue",
      closeDate: "2026-01-06",
      cycleDays: 5,
    });
  });
});
