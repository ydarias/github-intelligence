import "reflect-metadata";
import { issuesResponseSchema, type OrgMember } from "@github-intelligence/api-contracts";
import {
  FlatCacheIssuesRepository,
  FlatCachePullRequestsRepository,
  type GithubIssue,
} from "@github-intelligence/issues";
import { FlatCacheMembersRepository } from "@github-intelligence/members";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module.js";
import { ConfigureApp } from "../src/configure-app.js";

function item(id: number, overrides: Partial<GithubIssue>): GithubIssue {
  return {
    id,
    number: id,
    repository: "o/r",
    title: `Item ${id}`,
    body: `Body ${id}`,
    state: "open",
    createdAt: "2026-01-01T00:00:00Z",
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

const oldest = item(1, { createdAt: "2026-01-01T00:00:00Z", labels: ["bug"], assignees: ["bob"] });
const middle = item(2, {
  createdAt: "2026-01-03T00:00:00Z",
  state: "closed",
  closedAt: "2026-01-04T00:00:00Z",
  author: "bob",
  labels: ["feature", "bug"],
});
const newest = item(3, { createdAt: "2026-01-05T00:00:00Z", type: "pr", body: null });

const members: OrgMember[] = [
  {
    id: 1,
    login: "alice",
    name: "Alice Smith",
    email: null,
    createdAt: "2020-01-01T00:00:00Z",
    talentId: null,
    jobRole: null,
  },
];

describe("GET /api/issues", () => {
  let app: INestApplication;

  async function createApp(cachedIssues: GithubIssue[], cachedPrs: GithubIssue[]): Promise<void> {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FlatCacheIssuesRepository)
      .useValue({ loadAll: () => cachedIssues })
      .overrideProvider(FlatCachePullRequestsRepository)
      .useValue({ loadAll: () => cachedPrs })
      .overrideProvider(FlatCacheMembersRepository)
      .useValue({ loadAll: () => members })
      .compile();
    app = moduleRef.createNestApplication();
    ConfigureApp.apply(app);
    await app.init();
  }

  afterEach(async () => {
    await app.close();
  });

  it("returns all items sorted by createdAt descending, with nothing stripped", async () => {
    await createApp([oldest, middle], [newest]);

    const response = await request(app.getHttpServer()).get("/api/issues").expect(200);

    expect(response.body.issues).toEqual([newest, middle, oldest]);
    expect(response.body.total).toBe(3);
    expect(issuesResponseSchema.parse(response.body)).toEqual(response.body);
  });

  it("returns the stats with the authors joined with the members", async () => {
    await createApp([oldest, middle], [newest]);

    const response = await request(app.getHttpServer()).get("/api/issues").expect(200);

    expect(response.body.stats).toMatchObject({ total: 2, open: 1, closed: 1, totalPRs: 1 });
    expect(response.body.stats.byAuthor).toEqual([
      { login: "alice", name: "Alice Smith", total: 2, open: 2, closed: 0, percentage: 66.7 },
      { login: "bob", name: null, total: 1, open: 0, closed: 1, percentage: 33.3 },
    ]);
  });

  it("returns the filter options built from all items", async () => {
    await createApp([oldest, middle], [newest]);

    const response = await request(app.getHttpServer()).get("/api/issues").expect(200);

    expect(response.body.filterOptions).toEqual({
      authors: ["alice", "bob"],
      assignees: ["bob"],
      labels: ["bug", "feature"],
    });
  });

  it("returns the exact 404 body when nothing is cached", async () => {
    await createApp([], []);

    const response = await request(app.getHttpServer()).get("/api/issues").expect(404);

    expect(response.body).toEqual({ error: "No cached issues found. Run the CLI first." });
  });
});
