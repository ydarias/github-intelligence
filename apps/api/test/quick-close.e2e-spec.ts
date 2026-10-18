import "reflect-metadata";
import { quickCloseResponseSchema } from "@github-intelligence/api-contracts";
import {
  FlatCacheIssuesRepository,
  FlatCachePullRequestsRepository,
  type GithubIssue,
} from "@github-intelligence/issues";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module.js";
import { ConfigureApp } from "../src/configure-app.js";

function item(
  id: number,
  type: GithubIssue["type"],
  createdAt: string,
  closedAt: string | null,
): GithubIssue {
  return {
    id,
    number: id,
    repository: "o/r",
    title: `Item ${id}`,
    body: "body",
    state: closedAt === null ? "open" : "closed",
    createdAt,
    updatedAt: "2026-01-02T00:00:00Z",
    closedAt,
    url: `https://github.com/o/r/issues/${id}`,
    labels: ["bug"],
    author: "octocat",
    assignees: ["hubot"],
    type,
  };
}

const issues = [
  item(1, "issue", "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z"),
  item(2, "issue", "2026-01-01T10:00:00Z", "2026-01-01T13:00:00Z"),
];
const pullRequests = [item(3, "pr", "2026-01-02T10:00:00Z", "2026-01-02T10:10:00Z")];

// What the reporter's `computeQuickClose` returns for the fixtures above.
const reporterBody = {
  byDay: [{ date: "2026-01-01", count: 1 }],
  items: [
    {
      id: 1,
      number: 1,
      repository: "o/r",
      title: "Item 1",
      url: "https://github.com/o/r/issues/1",
    },
  ],
};

describe("GET /api/quick-close", () => {
  let app: INestApplication;

  async function createApp(
    cachedIssues: GithubIssue[],
    cachedPullRequests: GithubIssue[],
  ): Promise<void> {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FlatCacheIssuesRepository)
      .useValue({ loadAll: () => cachedIssues })
      .overrideProvider(FlatCachePullRequestsRepository)
      .useValue({ loadAll: () => cachedPullRequests })
      .compile();
    app = moduleRef.createNestApplication();
    ConfigureApp.apply(app);
    await app.init();
  }

  afterEach(async () => {
    await app.close();
  });

  it("returns the quick-close stats the reporter computes, with no fields stripped", async () => {
    await createApp(issues, pullRequests);

    const response = await request(app.getHttpServer()).get("/api/quick-close").expect(200);

    expect(quickCloseResponseSchema.parse(response.body)).toEqual(response.body);
    expect(response.body).toEqual(reporterBody);
  });

  it("returns the exact 404 body when nothing is cached", async () => {
    await createApp([], []);

    const response = await request(app.getHttpServer()).get("/api/quick-close").expect(404);

    expect(response.body).toEqual({ error: "No cached issues found. Run the CLI first." });
  });
});
