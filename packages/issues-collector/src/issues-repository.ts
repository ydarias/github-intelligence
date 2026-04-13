import flatCache from "flat-cache";
import type { GitHubIssue } from "./types.js";

export interface IssuesRepository {
  save(key: string, issues: GitHubIssue[]): void;
  load(key: string): GitHubIssue[] | undefined;
}

export class FlatCacheIssuesRepository implements IssuesRepository {
  private readonly cacheDir: string;

  constructor(cacheDir = "/tmp/.cache/issues-collector") {
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

  loadAll(): GitHubIssue[] {
    const cache = flatCache.create({ cacheId: "issues", cacheDir: this.cacheDir });
    const all = cache.all() as Record<string, GitHubIssue[]>;
    const seen = new Set<number>();
    const issues: GitHubIssue[] = [];

    for (const cached of Object.values(all)) {
      for (const issue of cached) {
        if (!seen.has(issue.id)) {
          seen.add(issue.id);
          issues.push(issue);
        }
      }
    }

    return issues;
  }
}
