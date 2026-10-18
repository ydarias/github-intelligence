import "reflect-metadata";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { ConfigureApp } from "./configure-app.js";

const DEFAULT_PORT = 3001;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  ConfigureApp.apply(app);
  await app.listen(Number(process.env["PORT"] ?? DEFAULT_PORT));
}

void bootstrap();
