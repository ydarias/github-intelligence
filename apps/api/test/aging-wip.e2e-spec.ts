import "reflect-metadata";
import { agingWipItemSchema } from "@github-intelligence/api-contracts";
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
  state: GithubIssue["state"],
  createdAt: string,
): GithubIssue {
  return {
    id,
    number: id + 100,
    repository: "o/r",
    title: `Item ${id}`,
    body: "body",
    state,
    createdAt,
    updatedAt: "2026-01-02T00:00:00Z",
    closedAt: state === "open" ? null : "2026-01-03T00:00:00Z",
    url: `https://github.com/o/r/issues/${id}`,
    labels: ["bug"],
    author: "octocat",
    assignees: ["hubot"],
    type,
  };
}

// Fixed in the past so the ages stay far from zero; the exact values are asserted below.
const issues = [
  item(1, "issue", "open", "2020-01-01T00:00:00Z"),
  item(2, "issue", "closed", "2020-01-01T00:00:00Z"),
];
const pullRequests = [item(3, "pr", "open", "2021-01-01T00:00:00Z")];

describe("GET /api/aging-wip", () => {
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

  it("returns the aging work in progress the reporter computes, with no fields stripped", async () => {
    await createApp(issues, pullRequests);

    const response = await request(app.getHttpServer()).get("/api/aging-wip").expect(200);

    expect(response.body.map((i: unknown) => agingWipItemSchema.parse(i))).toEqual(response.body);
    expect(response.body).toHaveLength(2);
    expect(response.body.map((i: { id: number }) => i.id)).toEqual([1, 3]);
    expect(response.body[0]).toEqual({
      id: 1,
      number: 101,
      title: "Item 1",
      url: "https://github.com/o/r/issues/1",
      repository: "o/r",
      type: "issue",
      ageDays: expect.any(Number),
      author: "octocat",
      assignees: ["hubot"],
      labels: ["bug"],
    });
  });

  it("returns the exact 404 body when nothing is cached", async () => {
    await createApp([], []);

    const response = await request(app.getHttpServer()).get("/api/aging-wip").expect(404);

    expect(response.body).toEqual({ error: "No cached issues found. Run the CLI first." });
  });
});
