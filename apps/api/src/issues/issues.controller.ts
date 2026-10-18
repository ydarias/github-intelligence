import { issuesResponseSchema, type IssuesResponse } from "@github-intelligence/api-contracts";
import { FlatCacheMembersRepository } from "@github-intelligence/members";
import { Controller, Get, SerializeOptions } from "@nestjs/common";

import { CachedItemsService } from "../common/cached-items.service.js";

import { IssueFilterOptionsService } from "./issue-filter-options.service.js";
import { IssueStatsService } from "./issue-stats.service.js";

@Controller("issues")
export class IssuesController {
  constructor(
    private readonly cachedItemsService: CachedItemsService,
    private readonly membersRepository: FlatCacheMembersRepository,
    private readonly issueStatsService: IssueStatsService,
    private readonly issueFilterOptionsService: IssueFilterOptionsService,
  ) {}

  @Get()
  @SerializeOptions({ schema: issuesResponseSchema })
  list(): IssuesResponse {
    const items = this.cachedItemsService.loadOrFail();
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      issues: items,
      stats: this.issueStatsService.compute(items, this.membersRepository.loadAll()),
      total: items.length,
      filterOptions: this.issueFilterOptionsService.build(items),
    };
  }
}
