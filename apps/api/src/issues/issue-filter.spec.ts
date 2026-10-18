import type { GithubIssue, IssuesQuery } from "@github-intelligence/api-contracts";

import { IssueFilter } from "./issue-filter.js";

function item(id: number, overrides: Partial<GithubIssue> = {}): GithubIssue {
  return {
    id,
    number: id,
    repository: "o/r",
    title: `Item ${id}`,
    body: null,
    state: "open",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-05T00:00:00Z",
    closedAt: null,
    url: `https://github.com/o/r/issues/${id}`,
    labels: [],
    author: "alice",
    assignees: [],
    type: "issue",
    ...overrides,
  };
}

const DEFAULT_QUERY: IssuesQuery = {
  type: "all",
  title: "",
  state: "all",
  author: "",
  assignee: "",
  labels: [],
  oneDayOnly: false,
};

function idsOf(items: GithubIssue[], query: Partial<IssuesQuery>): number[] {
  return new IssueFilter().apply(items, { ...DEFAULT_QUERY, ...query }).map((i) => i.id);
}

describe("IssueFilter", () => {
  it("keeps everything with the default query", () => {
    const items = [item(1), item(2, { type: "pr", state: "closed" }), item(3)];

    expect(idsOf(items, {})).toEqual([1, 2, 3]);
  });

  it("filters by type", () => {
    const items = [item(1), item(2, { type: "pr" })];

    expect(idsOf(items, { type: "pr" })).toEqual([2]);
    expect(idsOf(items, { type: "issue" })).toEqual([1]);
  });

  it("filters by title, ignoring case", () => {
    const items = [item(1, { title: "Fix Login bug" }), item(2, { title: "Add feature" })];

    expect(idsOf(items, { title: "LOGIN" })).toEqual([1]);
    expect(idsOf(items, { title: "login b" })).toEqual([1]);
  });

  it("filters by state", () => {
    const items = [item(1), item(2, { state: "closed" })];

    expect(idsOf(items, { state: "closed" })).toEqual([2]);
    expect(idsOf(items, { state: "open" })).toEqual([1]);
  });

  it("filters by author, exactly", () => {
    const items = [item(1, { author: "alice" }), item(2, { author: "bob" })];

    expect(idsOf(items, { author: "bob" })).toEqual([2]);
    expect(idsOf(items, { author: "bo" })).toEqual([]);
  });

  it("filters by assignee, treating missing assignees as empty", () => {
    const withoutAssignees = { ...item(3) } as Partial<GithubIssue>;
    delete withoutAssignees.assignees;
    const items = [
      item(1, { assignees: ["bob", "carol"] }),
      item(2, { assignees: ["dave"] }),
      withoutAssignees as GithubIssue,
    ];

    expect(idsOf(items, { assignee: "carol" })).toEqual([1]);
  });

  it("matches ANY of the labels, treating missing labels as empty", () => {
    const withoutLabels = { ...item(4) } as Partial<GithubIssue>;
    delete withoutLabels.labels;
    const items = [
      item(1, { labels: ["bug"] }),
      item(2, { labels: ["feature", "docs"] }),
      item(3, { labels: ["chore"] }),
      withoutLabels as GithubIssue,
    ];

    expect(idsOf(items, { labels: ["bug", "docs"] })).toEqual([1, 2]);
  });

  describe("oneDayOnly", () => {
    const sameDay = item(1, {
      createdAt: "2026-01-01T01:00:00Z",
      closedAt: "2026-01-01T23:00:00Z",
    });
    const otherDay = item(2, {
      createdAt: "2026-01-01T23:00:00Z",
      closedAt: "2026-01-02T01:00:00Z",
    });
    const stillOpen = item(3);

    it("keeps only items closed on the day they were created when true", () => {
      expect(idsOf([sameDay, otherDay, stillOpen], { oneDayOnly: true })).toEqual([1]);
    });

    it("keeps everything when false", () => {
      expect(idsOf([sameDay, otherDay, stillOpen], { oneDayOnly: false })).toEqual([1, 2, 3]);
    });
  });

  it("combines every filter with AND", () => {
    const items = [
      item(1, { type: "pr", state: "open", author: "alice", assignees: ["bob"], labels: ["bug"] }),
      item(2, {
        type: "pr",
        state: "closed",
        author: "alice",
        assignees: ["bob"],
        labels: ["bug"],
      }),
      item(3, {
        type: "issue",
        state: "open",
        author: "alice",
        assignees: ["bob"],
        labels: ["bug"],
      }),
      item(4, { type: "pr", state: "open", author: "carol", assignees: ["bob"], labels: ["bug"] }),
    ];

    expect(
      idsOf(items, {
        type: "pr",
        state: "open",
        author: "alice",
        assignee: "bob",
        labels: ["bug", "x"],
        title: "item",
      }),
    ).toEqual([1]);
  });
});
