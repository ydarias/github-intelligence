import {
  FlatCacheIssuesRepository,
  FlatCachePullRequestsRepository,
} from "@github-intelligence/issues";
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
    {
      provide: FlatCacheIssuesRepository,
      useFactory: () => new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]),
    },
    {
      provide: FlatCachePullRequestsRepository,
      useFactory: () => new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]),
    },
  ],
  exports: [FlatCacheMembersRepository, FlatCacheIssuesRepository, FlatCachePullRequestsRepository],
})
export class PersistenceModule {}
