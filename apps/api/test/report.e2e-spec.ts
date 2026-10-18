import "reflect-metadata";
import { reportResponseSchema } from "@github-intelligence/api-contracts";
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

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

function day(days: number): string {
  return daysAgo(days).toISOString().slice(0, 10);
}

const issues = [item(1, "issue", daysAgo(2).toISOString(), daysAgo(1).toISOString())];
const pullRequests = [item(2, "pr", daysAgo(1).toISOString(), null)];

describe("GET /api/report", () => {
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

  it("returns the report the reporter computes, with no fields stripped", async () => {
    await createApp(issues, pullRequests);

    const response = await request(app.getHttpServer()).get("/api/report").expect(200);

    expect(reportResponseSchema.parse(response.body)).toEqual(response.body);
    // What the reporter's `computeReport` returns: open counts per day, from the first creation to today.
    expect(response.body).toEqual({
      repositories: [
        {
          repository: "o/r",
          byDay: [
            { date: day(2), issues: 1, prs: 0 },
            { date: day(1), issues: 0, prs: 1 },
            { date: day(0), issues: 0, prs: 1 },
          ],
        },
      ],
    });
  });

  it("returns the exact 404 body when nothing is cached", async () => {
    await createApp([], []);

    const response = await request(app.getHttpServer()).get("/api/report").expect(404);

    expect(response.body).toEqual({ error: "No cached issues found. Run the CLI first." });
  });
});
