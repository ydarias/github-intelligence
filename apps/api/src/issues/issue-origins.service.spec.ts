import type { GithubIssue, OrgMember } from "@github-intelligence/api-contracts";

import { IssueOriginsService } from "./issue-origins.service.js";

function makeItem(overrides: Partial<GithubIssue> & { id: number; author: string }): GithubIssue {
  return {
    id: overrides.id,
    number: overrides.id,
    repository: overrides.repository ?? "owner/repo",
    title: `Issue ${overrides.id}`,
    body: null,
    state: overrides.state ?? "open",
    createdAt: overrides.createdAt ?? "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    closedAt: overrides.closedAt !== undefined ? overrides.closedAt : null,
    url: `https://github.com/owner/repo/issues/${overrides.id}`,
    author: overrides.author,
    labels: overrides.labels ?? [],
    assignees: overrides.assignees ?? [],
    type: overrides.type ?? "issue",
  };
}

function makeMember(login: string, name: string | null = null): OrgMember {
  return {
    id: 1,
    login,
    name,
    email: null,
    createdAt: "2024-01-01T00:00:00Z",
    talentId: null,
    jobRole: null,
  };
}

describe("IssueOriginsService", () => {
  const service = new IssueOriginsService();

  it("returns [] for empty input", () => {
    expect(service.compute([], [])).toEqual([]);
  });

  it("returns one entry for a single open item", () => {
    const items = [makeItem({ id: 1, author: "alice", state: "open" })];
    const result = service.compute(items, []);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      login: "alice",
      name: null,
      total: 1,
      open: 1,
      closed: 0,
      percentage: 100,
    });
  });

  it("returns one entry for a single closed item", () => {
    const items = [
      makeItem({ id: 1, author: "alice", state: "closed", closedAt: "2024-01-02T00:00:00Z" }),
    ];
    const result = service.compute(items, []);
    expect(result[0]).toEqual({
      login: "alice",
      name: null,
      total: 1,
      open: 0,
      closed: 1,
      percentage: 100,
    });
  });

  it("returns two entries sorted by total descending", () => {
    const items = [
      makeItem({ id: 1, author: "alice", state: "open" }),
      makeItem({ id: 2, author: "bob", state: "open" }),
      makeItem({ id: 3, author: "bob", state: "closed", closedAt: "2024-01-02T00:00:00Z" }),
    ];
    const result = service.compute(items, []);
    expect(result).toHaveLength(2);
    expect(result[0]!.login).toBe("bob");
    expect(result[0]!.total).toBe(2);
    expect(result[1]!.login).toBe("alice");
    expect(result[1]!.total).toBe(1);
  });

  it("populates name from members list when author is an org member", () => {
    const items = [makeItem({ id: 1, author: "alice" })];
    const result = service.compute(items, [makeMember("alice", "Alice Smith")]);
    expect(result[0]!.name).toBe("Alice Smith");
  });

  it("sets name to null when author is not in members list", () => {
    const items = [makeItem({ id: 1, author: "external-user" })];
    const result = service.compute(items, [makeMember("alice", "Alice Smith")]);
    expect(result[0]!.name).toBeNull();
  });

  it("correctly counts open and closed items per author", () => {
    const items = [
      makeItem({ id: 1, author: "alice", state: "open" }),
      makeItem({ id: 2, author: "alice", state: "closed", closedAt: "2024-01-02T00:00:00Z" }),
      makeItem({ id: 3, author: "alice", state: "closed", closedAt: "2024-01-03T00:00:00Z" }),
    ];
    const result = service.compute(items, []);
    expect(result[0]).toMatchObject({ login: "alice", total: 3, open: 1, closed: 2 });
  });

  it("rounds percentage to 1 decimal place", () => {
    const items = [
      makeItem({ id: 1, author: "alice" }),
      makeItem({ id: 2, author: "bob" }),
      makeItem({ id: 3, author: "carol" }),
    ];
    const result = service.compute(items, []);
    const percentages = result.map((e) => e.percentage);
    expect(percentages).toEqual(expect.arrayContaining([33.3, 33.3, 33.3]));
  });

  it("returns 0 percentage for all entries when items array is empty", () => {
    expect(service.compute([], [])).toEqual([]);
  });
});
