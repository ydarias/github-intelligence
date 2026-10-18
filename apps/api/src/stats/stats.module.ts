import { Module } from "@nestjs/common";

import { CommonModule } from "../common/common.module.js";

import { ThroughputController } from "./throughput.controller.js";
import { ThroughputService } from "./throughput.service.js";

@Module({
  imports: [CommonModule],
  controllers: [ThroughputController],
  providers: [ThroughputService],
})
export class StatsModule {}
