import { agingWipItemSchema, type AgingWipItem } from "@github-intelligence/api-contracts";
import { Controller, Get, SerializeOptions } from "@nestjs/common";

import { CachedItemsService } from "../common/cached-items.service.js";

import { AgingWipService } from "./aging-wip.service.js";

@Controller("aging-wip")
export class AgingWipController {
  constructor(
    private readonly cachedItemsService: CachedItemsService,
    private readonly agingWipService: AgingWipService,
  ) {}

  @Get()
  // The serializer validates array responses element by element, so it takes the item schema.
  @SerializeOptions({ schema: agingWipItemSchema })
  get(): AgingWipItem[] {
    return this.agingWipService.compute(this.cachedItemsService.loadOrFail());
  }
}
