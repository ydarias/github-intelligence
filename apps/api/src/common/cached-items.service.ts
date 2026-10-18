import {
  FlatCacheIssuesRepository,
  FlatCachePullRequestsRepository,
  type GithubIssue,
} from "@github-intelligence/issues";
import { Injectable } from "@nestjs/common";

import { NoCachedItemsException } from "./no-cached-items.exception.js";

@Injectable()
export class CachedItemsService {
  constructor(
    private readonly issuesRepository: FlatCacheIssuesRepository,
    private readonly pullRequestsRepository: FlatCachePullRequestsRepository,
  ) {}

  loadOrFail(): GithubIssue[] {
    const items = [...this.issuesRepository.loadAll(), ...this.pullRequestsRepository.loadAll()];

    if (items.length === 0) {
      throw new NoCachedItemsException();
    }

    return items;
  }
}
