import flatCache from "flat-cache";
import type { OrgMember } from "./types.js";

export interface MembersRepository {
  save(key: string, members: OrgMember[]): void;
  load(key: string): OrgMember[] | undefined;
  loadAll(): OrgMember[];
}

export class FlatCacheMembersRepository implements MembersRepository {
  private readonly cacheDir: string;

  constructor(
    cacheDir = process.env["CACHE_FOLDER"] ?? "/tmp/.cache/members-collector"
  ) {
    this.cacheDir = cacheDir;
  }

  save(key: string, members: OrgMember[]): void {
    const cache = flatCache.create({ cacheId: "members", cacheDir: this.cacheDir });
    cache.set(key, members);
    cache.save();
  }

  load(key: string): OrgMember[] | undefined {
    const cache = flatCache.create({ cacheId: "members", cacheDir: this.cacheDir });
    return cache.get<OrgMember[] | undefined>(key);
  }

  loadAll(): OrgMember[] {
    const cache = flatCache.create({ cacheId: "members", cacheDir: this.cacheDir });
    const all = cache.all() as Record<string, OrgMember[]>;
    const seen = new Set<number>();
    const members: OrgMember[] = [];
    for (const cached of Object.values(all)) {
      for (const member of cached) {
        if (!seen.has(member.id)) {
          seen.add(member.id);
          members.push(member);
        }
      }
    }
    return members;
  }
}
