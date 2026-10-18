import type { GithubIssue as DomainGithubIssue } from "@github-intelligence/github-client";

import type { GithubIssue } from "../types/github-issue.js";

import { githubIssueSchema } from "./github-issue.schema.js";

const validIssue: GithubIssue = {
  id: 1,
  number: 10,
  repository: "o/r",
  title: "Fix bug",
  body: "Details",
  state: "open",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
  closedAt: null,
  url: "https://github.com/o/r/issues/10",
  labels: ["bug"],
  author: "octocat",
  assignees: ["hubot"],
  type: "issue",
};

describe("githubIssueSchema", () => {
  it("parses a valid issue unchanged, without stripping body or updatedAt", () => {
    expect(githubIssueSchema.parse(validIssue)).toEqual(validIssue);
  });

  it("accepts a pull request with a null body and a closing date", () => {
    const pullRequest: GithubIssue = {
      ...validIssue,
      type: "pr",
      body: null,
      state: "closed",
      closedAt: "2026-01-03T00:00:00Z",
    };

    expect(githubIssueSchema.parse(pullRequest)).toEqual(pullRequest);
  });

  it("rejects an unknown type", () => {
    expect(githubIssueSchema.safeParse({ ...validIssue, type: "discussion" }).success).toBe(false);
  });

  it("rejects an issue with a missing field", () => {
    const incomplete: Partial<GithubIssue> = { ...validIssue };
    delete incomplete.updatedAt;

    expect(githubIssueSchema.safeParse(incomplete).success).toBe(false);
  });

  it("covers every field of the domain GithubIssue type", () => {
    const domainIssue: DomainGithubIssue = validIssue;

    expect(Object.keys(githubIssueSchema.shape).sort()).toEqual(Object.keys(domainIssue).sort());
  });
});
