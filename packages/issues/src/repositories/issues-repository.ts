import type { GithubIssue } from "@github-intelligence/github-client";
import flatCache from "flat-cache";

// TODO now it is sync, but other implementations could be async!!!
export interface IssuesRepository {
  saveAll(issues: GithubIssue[]): void;
  loadAll(): GithubIssue[];
}

export class FlatCacheIssuesRepository implements IssuesRepository {
  private readonly cacheDir: string;

  constructor(cacheDir = process.env["CACHE_FOLDER"] ?? "/tmp/.cache/issues-collector") {
    this.cacheDir = cacheDir;
  }

  saveAll(issues: GithubIssue[]): void {
    const cache = flatCache.create({ cacheId: "issues", cacheDir: this.cacheDir });
    for (const issue of issues) {
      cache.set(`${issue.id}`, [issue]);
    }
    cache.save();
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
          issues.push({ ...issue });
        }
      }
    }

    return issues;
  }
}
