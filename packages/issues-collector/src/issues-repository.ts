import flatCache from "flat-cache";
import type { GithubIssue } from "@github-intelligence/github-client";

export interface IssuesRepository {
  // TODO key is an implementation detail of the cache that shouldn't  be exposed
  save(key: string, issues: GithubIssue[]): void;
  load(key: string): GithubIssue[] | undefined;
}

export class FlatCacheIssuesRepository implements IssuesRepository {
  private readonly cacheDir: string;

  constructor(cacheDir = process.env["CACHE_FOLDER"] ?? "/tmp/.cache/issues-collector") {
    this.cacheDir = cacheDir;
  }

  save(key: string, issues: GithubIssue[]): void {
    const cache = flatCache.create({ cacheId: "issues", cacheDir: this.cacheDir });
    cache.set(key, issues);
    cache.save();
  }

  load(key: string): GithubIssue[] | undefined {
    const cache = flatCache.create({ cacheId: "issues", cacheDir: this.cacheDir });
    return cache.get<GithubIssue[] | undefined>(key);
  }

  loadAll(): GithubIssue[] {
    const cache = flatCache.create({ cacheId: "issues", cacheDir: this.cacheDir });
    const all = cache.all() as Record<string, GithubIssue[]>;
    const seen = new Set<number>();
    const issues: GithubIssue[] = [];

    for (const cached of Object.values(all)) {
      for (const issue of cached) {
        if (!seen.has(issue.id)) {
          seen.add(issue.id);
          issues.push({ ...issue, type: "issue" });
        }
      }
    }

    return issues;
  }
}
