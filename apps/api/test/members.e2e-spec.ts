import "reflect-metadata";
import type { OrgMember } from "@github-intelligence/api-contracts";
import { FlatCacheMembersRepository } from "@github-intelligence/members";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module.js";
import { ConfigureApp } from "../src/configure-app.js";

const member: OrgMember = {
  id: 1,
  login: "octocat",
  name: "Octo Cat",
  email: null,
  createdAt: "2020-01-01T00:00:00Z",
  talentId: "T-1",
  jobRole: null,
};

describe("GET /api/members", () => {
  let app: INestApplication;

  async function createApp(members: unknown[]): Promise<void> {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
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

  it("returns the members held by the repository", async () => {
    await createApp([member]);

    const response = await request(app.getHttpServer()).get("/api/members").expect(200);

    expect(response.body).toEqual([member]);
  });

  it("returns an empty array when there are no members", async () => {
    await createApp([]);

    const response = await request(app.getHttpServer()).get("/api/members").expect(200);

    expect(response.body).toEqual([]);
  });

  it("fails with a 5xx when the repository returns a member that breaks the schema", async () => {
    await createApp([{ ...member, id: "not-a-number" }]);

    const response = await request(app.getHttpServer()).get("/api/members");

    expect(response.status).toBeGreaterThanOrEqual(500);
  });

  it("sends CORS headers", async () => {
    await createApp([]);

    const response = await request(app.getHttpServer())
      .get("/api/members")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });
});
