import { Module } from "@nestjs/common";

import { CommonModule } from "../common/common.module.js";

import { AgingWipController } from "./aging-wip.controller.js";
import { AgingWipService } from "./aging-wip.service.js";
import { CycleTimeController } from "./cycle-time.controller.js";
import { CycleTimeService } from "./cycle-time.service.js";
import { ThroughputController } from "./throughput.controller.js";
import { ThroughputService } from "./throughput.service.js";

@Module({
  imports: [CommonModule],
  controllers: [AgingWipController, CycleTimeController, ThroughputController],
  providers: [AgingWipService, CycleTimeService, ThroughputService],
})
export class StatsModule {}
