import { Module } from "@nestjs/common";

import { CommonModule } from "../common/common.module.js";
import { PersistenceModule } from "../persistence/persistence.module.js";

import { IssueFilterOptionsService } from "./issue-filter-options.service.js";
import { IssueFilter } from "./issue-filter.js";
import { IssueOriginsService } from "./issue-origins.service.js";
import { IssueStatsService } from "./issue-stats.service.js";
import { IssuesController } from "./issues.controller.js";

@Module({
  imports: [CommonModule, PersistenceModule],
  controllers: [IssuesController],
  providers: [IssueFilter, IssueFilterOptionsService, IssueOriginsService, IssueStatsService],
})
export class IssuesModule {}
