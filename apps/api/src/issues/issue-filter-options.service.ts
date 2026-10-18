import type { GithubIssue, IssueFilterOptions } from "@github-intelligence/api-contracts";
import { Injectable } from "@nestjs/common";

@Injectable()
export class IssueFilterOptionsService {
  build(items: GithubIssue[]): IssueFilterOptions {
    return {
      authors: Array.from(new Set(items.map((i) => i.author))).sort(),
      assignees: Array.from(new Set(items.flatMap((i) => i.assignees ?? []))).sort(),
      labels: Array.from(new Set(items.flatMap((i) => i.labels ?? []))).sort(),
      repositories: Array.from(new Set(items.map((i) => i.repository))).sort(),
    };
  }
}
