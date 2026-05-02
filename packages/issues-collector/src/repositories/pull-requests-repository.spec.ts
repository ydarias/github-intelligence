import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";

import type { GithubIssue } from "@github-intelligence/github-client";

import { FlatCachePullRequestsRepository } from "./pull-requests-repository.js";

function tmpDir(): string {
  return path.join(os.tmpdir(), `issues-collector-test-${randomUUID()}`);
}

function makePR(id: number): GithubIssue {
  return {
    id,
    number: id,
    repository: "owner/repo",
    title: `PR ${id}`,
    body: null,
    state: "open",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    closedAt: null,
    url: `https://github.com/owner/repo/pull/${id}`,
    labels: [],
    author: "user",
    assignees: [],
    type: "pr",
  };
}

describe("FlatCachePullRequestsRepository", () => {
  it("returns empty array when cache is empty", () => {
    const repo = new FlatCachePullRequestsRepository(tmpDir());
    expect(repo.loadAll()).toEqual([]);
  });

  it("round-trips PRs via saveAll + loadAll", () => {
    const repo = new FlatCachePullRequestsRepository(tmpDir());
    repo.saveAll([makePR(10), makePR(20)]);
    const result = repo.loadAll();
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(expect.arrayContaining([10, 20]));
  });

  it("load returns the PR array for a known id", () => {
    const repo = new FlatCachePullRequestsRepository(tmpDir());
    repo.saveAll([makePR(42)]);
    const result = repo.load(42);
    expect(result).toBeDefined();
    expect(result?.[0]?.id).toBe(42);
  });

  it("load returns undefined for an unknown id", () => {
    const repo = new FlatCachePullRequestsRepository(tmpDir());
    expect(repo.load(999)).toBeUndefined();
  });

  it("deduplicates when the same id is saved twice", () => {
    const repo = new FlatCachePullRequestsRepository(tmpDir());
    repo.saveAll([makePR(1)]);
    repo.saveAll([makePR(1), makePR(2)]);
    expect(repo.loadAll()).toHaveLength(2);
  });
});
