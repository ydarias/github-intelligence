import type { GithubIssue } from "@github-intelligence/github-client";
import flatCache from "flat-cache";

// TODO at the repository level is really necessary to have the key? that is a cache impl detail
export interface PullRequestsRepository {
  save(key: string, prs: GithubIssue[]): void;
  load(key: string): GithubIssue[] | undefined;
  loadAll(): GithubIssue[];
}

export class FlatCachePullRequestsRepository implements PullRequestsRepository {
  private readonly cacheDir: string;

  constructor(cacheDir = process.env["CACHE_FOLDER"] ?? "/tmp/.cache/issues-collector") {
    this.cacheDir = cacheDir;
  }

  save(key: string, prs: GithubIssue[]): void {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    cache.set(key, prs);
    cache.save();
  }

  load(key: string): GithubIssue[] | undefined {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    return cache.get<GithubIssue[] | undefined>(key);
  }

  loadAll(): GithubIssue[] {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    const all = cache.all() as Record<string, GithubIssue[]>;
    const seen = new Set<number>();
    const prs: GithubIssue[] = [];

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
