import flatCache from "flat-cache";
import type { GitHubIssue } from "./types.js";

// TODO at the repository level is really necessary to have the key? that is a cache impl detail
export interface PullRequestsRepository {
  save(key: string, prs: GitHubIssue[]): void;
  load(key: string): GitHubIssue[] | undefined;
  loadAll(): GitHubIssue[];
}

export class FlatCachePullRequestsRepository implements PullRequestsRepository {
  private readonly cacheDir: string;

  constructor(cacheDir = process.env["CACHE_FOLDER"] ?? "/tmp/.cache/issues-collector") {
    this.cacheDir = cacheDir;
  }

  save(key: string, prs: GitHubIssue[]): void {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    cache.set(key, prs);
    cache.save();
  }

  load(key: string): GitHubIssue[] | undefined {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    return cache.get<GitHubIssue[] | undefined>(key);
  }

  loadAll(): GitHubIssue[] {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    const all = cache.all() as Record<string, GitHubIssue[]>;
    const seen = new Set<number>();
    const prs: GitHubIssue[] = [];

    for (const cached of Object.values(all)) {
      for (const pr of cached) {
        if (!seen.has(pr.id)) {
          seen.add(pr.id);
          prs.push({ ...pr, type: "pr" });
        }
      }
    }

    return prs;
  }
}
