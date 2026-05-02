import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";

import type { GithubIssue } from "@github-intelligence/github-client";

import { FlatCacheIssuesRepository } from "./issues-repository.js";

function tmpDir(): string {
  return path.join(os.tmpdir(), `issues-collector-test-${randomUUID()}`);
}

function makeIssue(id: number): GithubIssue {
  return {
    id,
    number: id,
    repository: "owner/repo",
    title: `Issue ${id}`,
    body: null,
    state: "open",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    closedAt: null,
    url: `https://github.com/owner/repo/issues/${id}`,
    labels: [],
    author: "user",
    assignees: [],
    type: "issue",
  };
}

describe("FlatCacheIssuesRepository", () => {
  it("returns empty array when cache is empty", () => {
    const repo = new FlatCacheIssuesRepository(tmpDir());
    expect(repo.loadAll()).toEqual([]);
  });

  it("round-trips issues via saveAll + loadAll", () => {
    const repo = new FlatCacheIssuesRepository(tmpDir());
    repo.saveAll([makeIssue(1), makeIssue(2)]);
    const result = repo.loadAll();
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual(expect.arrayContaining([1, 2]));
  });

  it("deduplicates when the same id is saved twice", () => {
    const repo = new FlatCacheIssuesRepository(tmpDir());
    repo.saveAll([makeIssue(1)]);
    repo.saveAll([makeIssue(1), makeIssue(2)]);
    expect(repo.loadAll()).toHaveLength(2);
  });
});
