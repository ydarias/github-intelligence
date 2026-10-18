import "reflect-metadata";
import { cycleTimeResponseSchema } from "@github-intelligence/api-contracts";
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

function item(id: number, type: GithubIssue["type"], closedAt: string | null): GithubIssue {
  return {
    id,
    number: id,
    repository: "o/r",
    title: `Item ${id}`,
    body: "body",
    state: closedAt === null ? "open" : "closed",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
    closedAt,
    url: `https://github.com/o/r/issues/${id}`,
    labels: ["bug"],
    author: "octocat",
    assignees: ["hubot"],
    type,
  };
}

const issues = [item(1, "issue", "2026-01-09T10:00:00Z"), item(2, "issue", null)];
const pullRequests = [item(3, "pr", "2026-01-04T10:00:00Z")];

// What the reporter's `computeCycleTime` returns for the fixtures above.
const reporterBody = {
  items: [
    {
      id: 3,
      title: "Item 3",
      url: "https://github.com/o/r/issues/3",
      repository: "o/r",
      type: "pr",
      closeDate: "2026-01-04",
      cycleDays: 3,
    },
    {
      id: 1,
      title: "Item 1",
      url: "https://github.com/o/r/issues/1",
      repository: "o/r",
      type: "issue",
      closeDate: "2026-01-09",
      cycleDays: 8,
    },
  ],
};

describe("GET /api/cycle-time", () => {
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

  it("returns the cycle time the reporter computes, with no fields stripped", async () => {
    await createApp(issues, pullRequests);

    const response = await request(app.getHttpServer()).get("/api/cycle-time").expect(200);

    expect(cycleTimeResponseSchema.parse(response.body)).toEqual(response.body);
    expect(response.body).toEqual(reporterBody);
  });

  it("returns the exact 404 body when nothing is cached", async () => {
    await createApp([], []);

    const response = await request(app.getHttpServer()).get("/api/cycle-time").expect(404);

    expect(response.body).toEqual({ error: "No cached issues found. Run the CLI first." });
  });
});
