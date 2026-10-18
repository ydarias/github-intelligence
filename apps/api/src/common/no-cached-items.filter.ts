import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

import { NoCachedItemsException } from "./no-cached-items.exception.js";

// The UI reads `err.error`, so the body keeps the reporter's `{ error }` shape.
@Catch(NoCachedItemsException)
export class NoCachedItemsFilter implements ExceptionFilter<NoCachedItemsException> {
  catch(exception: NoCachedItemsException, host: ArgumentsHost): void {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.NOT_FOUND)
      .json({ error: exception.message });
  }
}
