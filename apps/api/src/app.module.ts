import { Module } from "@nestjs/common";

import { IssuesModule } from "./issues/issues.module.js";
import { MembersModule } from "./members/members.module.js";
import { StatsModule } from "./stats/stats.module.js";

@Module({ imports: [IssuesModule, MembersModule, StatsModule] })
export class AppModule {}
