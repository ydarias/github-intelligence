import { reportResponseSchema, type ReportResponse } from "@github-intelligence/api-contracts";
import { Controller, Get, SerializeOptions } from "@nestjs/common";

import { CachedItemsService } from "../common/cached-items.service.js";

import { ReportService } from "./report.service.js";

@Controller("report")
export class ReportController {
  constructor(
    private readonly cachedItemsService: CachedItemsService,
    private readonly reportService: ReportService,
  ) {}

  @Get()
  @SerializeOptions({ schema: reportResponseSchema })
  get(): ReportResponse {
    return this.reportService.compute(this.cachedItemsService.loadOrFail());
  }
}
