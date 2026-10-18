import {
  quickCloseResponseSchema,
  type QuickCloseResponse,
} from "@github-intelligence/api-contracts";
import { Controller, Get, SerializeOptions } from "@nestjs/common";

import { CachedItemsService } from "../common/cached-items.service.js";

import { QuickCloseService } from "./quick-close.service.js";

@Controller("quick-close")
export class QuickCloseController {
  constructor(
    private readonly cachedItemsService: CachedItemsService,
    private readonly quickCloseService: QuickCloseService,
  ) {}

  @Get()
  @SerializeOptions({ schema: quickCloseResponseSchema })
  get(): QuickCloseResponse {
    return this.quickCloseService.compute(this.cachedItemsService.loadOrFail());
  }
}
