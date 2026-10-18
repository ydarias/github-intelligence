import {
  throughputResponseSchema,
  type ThroughputResponse,
} from "@github-intelligence/api-contracts";
import { Controller, Get, SerializeOptions } from "@nestjs/common";

import { CachedItemsService } from "../common/cached-items.service.js";

import { ThroughputService } from "./throughput.service.js";

@Controller("throughput")
export class ThroughputController {
  constructor(
    private readonly cachedItemsService: CachedItemsService,
    private readonly throughputService: ThroughputService,
  ) {}

  @Get()
  @SerializeOptions({ schema: throughputResponseSchema })
  get(): ThroughputResponse {
    return this.throughputService.compute(this.cachedItemsService.loadOrFail());
  }
}
