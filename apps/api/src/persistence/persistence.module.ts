import { FlatCacheMembersRepository } from "@github-intelligence/members";
import { Module } from "@nestjs/common";

// The repository classes are the DI tokens: tests replace them with
// `overrideProvider(FlatCacheMembersRepository).useValue(fake)`.
@Module({
  providers: [
    {
      provide: FlatCacheMembersRepository,
      useFactory: () => new FlatCacheMembersRepository(process.env["CACHE_FOLDER"]),
    },
  ],
  exports: [FlatCacheMembersRepository],
})
export class PersistenceModule {}
