import {
  type INestApplication,
  StandardSchemaSerializerInterceptor,
  StandardSchemaValidationPipe,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export class ConfigureApp {
  static readonly GLOBAL_PREFIX = "api";

  static apply(app: INestApplication): void {
    app.setGlobalPrefix(ConfigureApp.GLOBAL_PREFIX);
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    app.useGlobalInterceptors(new StandardSchemaSerializerInterceptor(app.get(Reflector)));
    app.enableCors();
  }
}
