import { Module } from "@nestjs/common";

import { CommonModule } from "../common/common.module.js";

import { AgingWipController } from "./aging-wip.controller.js";
import { AgingWipService } from "./aging-wip.service.js";
import { CycleTimeController } from "./cycle-time.controller.js";
import { CycleTimeService } from "./cycle-time.service.js";
import { QuickCloseController } from "./quick-close.controller.js";
import { QuickCloseService } from "./quick-close.service.js";
import { ReportController } from "./report.controller.js";
import { ReportService } from "./report.service.js";
import { ThroughputController } from "./throughput.controller.js";
import { ThroughputService } from "./throughput.service.js";

@Module({
  imports: [CommonModule],
  controllers: [
    AgingWipController,
    CycleTimeController,
    QuickCloseController,
    ReportController,
    ThroughputController,
  ],
  providers: [
    AgingWipService,
    CycleTimeService,
    QuickCloseService,
    ReportService,
    ThroughputService,
  ],
})
export class StatsModule {}
