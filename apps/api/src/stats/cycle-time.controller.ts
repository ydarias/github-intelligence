import {
  cycleTimeResponseSchema,
  type CycleTimeResponse,
} from "@github-intelligence/api-contracts";
import { Controller, Get, SerializeOptions } from "@nestjs/common";

import { CachedItemsService } from "../common/cached-items.service.js";

import { CycleTimeService } from "./cycle-time.service.js";

@Controller("cycle-time")
export class CycleTimeController {
  constructor(
    private readonly cachedItemsService: CachedItemsService,
    private readonly cycleTimeService: CycleTimeService,
  ) {}

  @Get()
  @SerializeOptions({ schema: cycleTimeResponseSchema })
  get(): CycleTimeResponse {
    return this.cycleTimeService.compute(this.cachedItemsService.loadOrFail());
  }
}
