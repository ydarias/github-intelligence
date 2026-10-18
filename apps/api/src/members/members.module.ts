import { Module } from "@nestjs/common";

import { PersistenceModule } from "../persistence/persistence.module.js";

import { MembersController } from "./members.controller.js";

@Module({
  imports: [PersistenceModule],
  controllers: [MembersController],
})
export class MembersModule {}
