import flatCache from "flat-cache";
import type { GitHubIssue } from "./types.js";

export interface IssuesRepository {
  save(key: string, issues: GitHubIssue[]): void;
  load(key: string): GitHubIssue[] | undefined;
}

export class FlatCacheIssuesRepository implements IssuesRepository {
  private readonly cacheDir: string;

  constructor(cacheDir = ".cache/issues-collector") {
    this.cacheDir = cacheDir;
  }

  save(key: string, issues: GitHubIssue[]): void {
    const cache = flatCache.create({ cacheId: "issues", cacheDir: this.cacheDir });
    cache.set(key, issues);
    cache.save();
  }

  load(key: string): GitHubIssue[] | undefined {
    const cache = flatCache.create({ cacheId: "issues", cacheDir: this.cacheDir });
    return cache.get<GitHubIssue[] | undefined>(key);
  }
}
