import { Module } from "@nestjs/common";

import { PersistenceModule } from "../persistence/persistence.module.js";

import { CachedItemsService } from "./cached-items.service.js";

@Module({
  imports: [PersistenceModule],
  providers: [CachedItemsService],
  exports: [CachedItemsService],
})
export class CommonModule {}
