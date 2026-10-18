import { Module } from "@nestjs/common";

import { MembersModule } from "./members/members.module.js";
import { StatsModule } from "./stats/stats.module.js";

@Module({ imports: [MembersModule, StatsModule] })
export class AppModule {}
