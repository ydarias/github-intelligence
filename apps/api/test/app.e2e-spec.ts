import "reflect-metadata";
import { type INestApplication, Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module.js";
import { ConfigureApp } from "../src/configure-app.js";

@Injectable()
class DependencyB {}

@Injectable()
class ServiceA {
  constructor(readonly b: DependencyB) {}
}

describe("API foundation", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    ConfigureApp.apply(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 404 for an unknown route under the api prefix", async () => {
    await request(app.getHttpServer()).get("/api/does-not-exist").expect(404);
  });

  it("resolves constructor dependencies through emitted decorator metadata", async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ServiceA, DependencyB],
    }).compile();

    expect(moduleRef.get(ServiceA).b).toBeInstanceOf(DependencyB);
  });
});
