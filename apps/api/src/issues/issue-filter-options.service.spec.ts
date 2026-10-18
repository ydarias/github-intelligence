import type { GithubIssue } from "@github-intelligence/api-contracts";

import { IssueFilterOptionsService } from "./issue-filter-options.service.js";

function makeItem(id: number, overrides: Partial<GithubIssue> = {}): GithubIssue {
  return {
    id,
    number: id,
    repository: "o/r",
    title: `Item ${id}`,
    body: null,
    state: "open",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    closedAt: null,
    url: `https://github.com/o/r/issues/${id}`,
    labels: [],
    author: "octocat",
    assignees: [],
    type: "issue",
    ...overrides,
  };
}

describe("IssueFilterOptionsService", () => {
  const service = new IssueFilterOptionsService();

  it("returns empty options for no items", () => {
    expect(service.build([])).toEqual({ authors: [], assignees: [], labels: [] });
  });

  it("dedupes and sorts authors, assignees and labels", () => {
    const items = [
      makeItem(1, { author: "zoe", assignees: ["bob", "amy"], labels: ["feature", "bug"] }),
      makeItem(2, { author: "alice", assignees: ["amy"], labels: ["bug"] }),
      makeItem(3, { author: "zoe", assignees: [], labels: [] }),
    ];

    expect(service.build(items)).toEqual({
      authors: ["alice", "zoe"],
      assignees: ["amy", "bob"],
      labels: ["bug", "feature"],
    });
  });

  it("tolerates items cached without assignees or labels", () => {
    const legacy = {
      ...makeItem(1),
      assignees: undefined,
      labels: undefined,
    } as unknown as GithubIssue;

    expect(service.build([legacy])).toEqual({ authors: ["octocat"], assignees: [], labels: [] });
  });
});
