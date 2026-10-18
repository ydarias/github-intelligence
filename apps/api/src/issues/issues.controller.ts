import {
  issuesQuerySchema,
  issuesResponseSchema,
  type GithubIssue,
  type IssuesQuery,
  type IssuesResponse,
  type IssueStats,
  type OrgMember,
} from "@github-intelligence/api-contracts";
import { FlatCacheMembersRepository } from "@github-intelligence/members";
import { Controller, Get, Query, SerializeOptions } from "@nestjs/common";

import { CachedItemsService } from "../common/cached-items.service.js";

import { IssueFilterOptionsService } from "./issue-filter-options.service.js";
import { IssueFilter } from "./issue-filter.js";
import { IssueStatsService } from "./issue-stats.service.js";

@Controller("issues")
export class IssuesController {
  constructor(
    private readonly cachedItemsService: CachedItemsService,
    private readonly membersRepository: FlatCacheMembersRepository,
    private readonly issueStatsService: IssueStatsService,
    private readonly issueFilterOptionsService: IssueFilterOptionsService,
    private readonly issueFilter: IssueFilter,
  ) {}

  @Get()
  @SerializeOptions({ schema: issuesResponseSchema })
  list(@Query({ schema: issuesQuerySchema }) query: IssuesQuery): IssuesResponse {
    const items = this.cachedItemsService.loadOrFail();
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const filtered = this.issueFilter.apply(items, query);

    return {
      issues: filtered,
      stats: this.computeStats(filtered, items, this.membersRepository.loadAll()),
      total: filtered.length,
      filterOptions: this.issueFilterOptionsService.build(items),
    };
  }

  // When the filters match nothing there are no days to chart, so the chart
  // falls back to the days of the unfiltered set.
  private computeStats(
    filtered: GithubIssue[],
    all: GithubIssue[],
    members: OrgMember[],
  ): IssueStats {
    const stats = this.issueStatsService.compute(filtered, members);
    if (filtered.length > 0) return stats;

    return { ...stats, byDay: this.issueStatsService.compute(all, members).byDay };
  }
}
