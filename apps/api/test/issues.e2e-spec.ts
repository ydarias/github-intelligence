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
const newest = item(3, {
  createdAt: "2026-01-05T00:00:00Z",
  type: "pr",
  body: null,
  repository: "o/ui",
});

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
      repositories: ["o/r", "o/ui"],
    });
  });

  it("returns the exact 404 body when nothing is cached", async () => {
    await createApp([], []);

    const response = await request(app.getHttpServer()).get("/api/issues").expect(404);

    expect(response.body).toEqual({ error: "No cached issues found. Run the CLI first." });
  });

  describe("filters", () => {
    const closedSameDay = item(4, {
      createdAt: "2026-02-01T08:00:00Z",
      state: "closed",
      closedAt: "2026-02-01T18:00:00Z",
      type: "pr",
      author: "bob",
    });

    it("returns only the matches, with total equal to the filtered count", async () => {
      await createApp([oldest, middle], [newest, closedSameDay]);

      const response = await request(app.getHttpServer())
        .get("/api/issues?type=pr&state=closed")
        .expect(200);

      expect(response.body.issues).toEqual([closedSameDay]);
      expect(response.body.total).toBe(1);
    });

    it("parses comma-separated labels and the oneDayOnly flag", async () => {
      await createApp([oldest, middle], [newest, closedSameDay]);

      const labels = await request(app.getHttpServer())
        .get("/api/issues?labels=feature,nope")
        .expect(200);
      const oneDay = await request(app.getHttpServer())
        .get("/api/issues?oneDayOnly=true")
        .expect(200);

      expect(labels.body.issues).toEqual([middle]);
      expect(oneDay.body.issues).toEqual([closedSameDay]);
    });

    it("filters by the exact repository name", async () => {
      await createApp([oldest, middle], [newest]);

      const exact = await request(app.getHttpServer())
        .get("/api/issues?repository=o/ui")
        .expect(200);
      const partial = await request(app.getHttpServer())
        .get("/api/issues?repository=ui")
        .expect(200);

      expect(exact.body.issues).toEqual([newest]);
      expect(partial.body.issues).toEqual([]);
    });

    it("computes the stats over the filtered set", async () => {
      await createApp([oldest, middle], [newest]);

      const response = await request(app.getHttpServer()).get("/api/issues?author=bob").expect(200);

      expect(response.body.stats).toMatchObject({ total: 1, open: 0, closed: 1, totalPRs: 0 });
      expect(response.body.stats.byAuthor).toEqual([
        { login: "bob", name: null, total: 1, open: 0, closed: 1, percentage: 100 },
      ]);
      expect(response.body.stats.byDay).toEqual([{ date: "2026-01-03", issues: 1, prs: 0 }]);
    });

    it("keeps the filter options built from the unfiltered set", async () => {
      await createApp([oldest, middle], [newest]);

      const response = await request(app.getHttpServer()).get("/api/issues?author=bob").expect(200);

      expect(response.body.filterOptions).toEqual({
        authors: ["alice", "bob"],
        assignees: ["bob"],
        labels: ["bug", "feature"],
        repositories: ["o/r", "o/ui"],
      });
    });

    it("returns 200 with no issues and the unfiltered byDay when nothing matches", async () => {
      await createApp([oldest, middle], [newest]);

      const response = await request(app.getHttpServer())
        .get("/api/issues?author=nobody")
        .expect(200);

      expect(response.body.issues).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.stats.total).toBe(0);
      expect(response.body.stats.byDay).toEqual([
        { date: "2026-01-01", issues: 1, prs: 0 },
        { date: "2026-01-03", issues: 1, prs: 0 },
        { date: "2026-01-05", issues: 0, prs: 1 },
      ]);
      expect(response.body.filterOptions.authors).toEqual(["alice", "bob"]);
    });

    it.each(["type=foo", "state=merged", "oneDayOnly=maybe"])(
      "returns 400 for %s",
      async (query) => {
        await createApp([oldest, middle], [newest]);

        await request(app.getHttpServer()).get(`/api/issues?${query}`).expect(400);
      },
    );

    it("returns the exact 404 body when nothing is cached, whatever the filters", async () => {
      await createApp([], []);

      const response = await request(app.getHttpServer())
        .get("/api/issues?type=pr&labels=bug")
        .expect(404);

      expect(response.body).toEqual({ error: "No cached issues found. Run the CLI first." });
    });
  });
});
