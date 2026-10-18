import type { GithubIssue } from "@github-intelligence/github-client";
import flatCache from "flat-cache";

// TODO now it is sync, but other implementations could be async!!!
export interface PullRequestsRepository {
  saveAll(prs: GithubIssue[]): void;
  load(id: number): GithubIssue[] | undefined;
  loadAll(): GithubIssue[];
}

export class FlatCachePullRequestsRepository implements PullRequestsRepository {
  private readonly cacheDir: string;

  constructor(cacheDir = process.env["CACHE_FOLDER"] ?? "/tmp/.cache/issues-collector") {
    this.cacheDir = cacheDir;
  }

  saveAll(prs: GithubIssue[]): void {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    for (const pr of prs) {
      cache.set(`${pr.id}`, [pr]);
    }
    cache.save();
  }

  load(id: number): GithubIssue[] | undefined {
    const cache = flatCache.create({ cacheId: "pull-requests", cacheDir: this.cacheDir });
    return cache.get<GithubIssue[] | undefined>(`${id}`);
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
          prs.push({ ...pr });
        }
      }
    }

    return prs;
  }
}
