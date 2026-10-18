import type {
  FlatCacheIssuesRepository,
  FlatCachePullRequestsRepository,
  GithubIssue,
} from "@github-intelligence/issues";

import { CachedItemsService } from "./cached-items.service.js";
import { NoCachedItemsException } from "./no-cached-items.exception.js";

function item(id: number, type: GithubIssue["type"]): GithubIssue {
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
    type,
  };
}

function createService(issues: GithubIssue[], pullRequests: GithubIssue[]): CachedItemsService {
  return new CachedItemsService(
    { loadAll: () => issues } as FlatCacheIssuesRepository,
    { loadAll: () => pullRequests } as FlatCachePullRequestsRepository,
  );
}

describe("CachedItemsService", () => {
  it("returns the issues followed by the pull requests", () => {
    const issue = item(1, "issue");
    const pullRequest = item(2, "pr");

    expect(createService([issue], [pullRequest]).loadOrFail()).toEqual([issue, pullRequest]);
  });

  it("returns the items when only pull requests are cached", () => {
    const pullRequest = item(2, "pr");

    expect(createService([], [pullRequest]).loadOrFail()).toEqual([pullRequest]);
  });

  it("throws NoCachedItemsException when the cache is empty", () => {
    expect(() => createService([], []).loadOrFail()).toThrow(NoCachedItemsException);
  });
});
