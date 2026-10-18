import type { GithubIssue } from "@github-intelligence/issues";

import { AgingWipService } from "./aging-wip.service.js";

function item(
  id: number,
  state: GithubIssue["state"],
  createdAt: string,
  overrides: Partial<GithubIssue> = {},
): GithubIssue {
  return {
    id,
    number: id + 100,
    repository: "o/r",
    title: `Item ${id}`,
    body: "body",
    state,
    createdAt,
    updatedAt: "2026-01-02T00:00:00Z",
    closedAt: state === "open" ? null : "2026-01-03T00:00:00Z",
    url: `https://github.com/o/r/issues/${id}`,
    labels: ["bug"],
    author: "octocat",
    assignees: ["hubot"],
    type: "issue",
    ...overrides,
  };
}

describe("AgingWipService", () => {
  const service = new AgingWipService();

  it("returns nothing when there are no items", () => {
    expect(service.compute([], "2026-01-10")).toEqual([]);
  });

  it("excludes items that are not open", () => {
    expect(service.compute([item(1, "closed", "2026-01-01T00:00:00Z")], "2026-01-10")).toEqual([]);
  });

  it("computes the age in whole days from creation to the given date", () => {
    const result = service.compute([item(1, "open", "2026-01-01T00:00:00Z")], "2026-01-10");

    expect(result[0]?.ageDays).toBe(9);
  });

  it("rounds the age down to whole days", () => {
    const result = service.compute([item(1, "open", "2026-01-01T18:00:00Z")], "2026-01-10");

    expect(result[0]?.ageDays).toBe(8);
  });

  it("gives an age of zero to an item created the same day", () => {
    const result = service.compute([item(1, "open", "2026-01-10T00:00:00Z")], "2026-01-10");

    expect(result[0]?.ageDays).toBe(0);
  });

  it("sorts the oldest items first", () => {
    const result = service.compute(
      [
        item(1, "open", "2026-01-08T00:00:00Z"),
        item(2, "open", "2026-01-01T00:00:00Z"),
        item(3, "open", "2026-01-05T00:00:00Z"),
      ],
      "2026-01-10",
    );

    expect(result.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  it("exposes the fields of an aging item and nothing else", () => {
    const result = service.compute(
      [item(1, "open", "2026-01-01T00:00:00Z", { type: "pr" })],
      "2026-01-10",
    );

    expect(result).toEqual([
      {
        id: 1,
        number: 101,
        title: "Item 1",
        url: "https://github.com/o/r/issues/1",
        repository: "o/r",
        type: "pr",
        ageDays: 9,
        author: "octocat",
        assignees: ["hubot"],
        labels: ["bug"],
      },
    ]);
  });
});
