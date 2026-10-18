import { type INestApplication } from "@nestjs/common";

export class ConfigureApp {
  static readonly GLOBAL_PREFIX = "api";

  static apply(app: INestApplication): void {
    app.setGlobalPrefix(ConfigureApp.GLOBAL_PREFIX);
  }
}
