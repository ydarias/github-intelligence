import type { GithubIssue, IssuesQuery } from "@github-intelligence/api-contracts";
import { Injectable } from "@nestjs/common";

@Injectable()
export class IssueFilter {
  apply(items: GithubIssue[], filters: IssuesQuery): GithubIssue[] {
    return items.filter((i) => {
      if (filters.type !== "all" && i.type !== filters.type) return false;
      if (filters.title !== "" && !i.title.toLowerCase().includes(filters.title.toLowerCase()))
        return false;
      if (filters.state !== "all" && i.state !== filters.state) return false;
      if (filters.author !== "" && i.author !== filters.author) return false;
      if (filters.assignee !== "" && !(i.assignees ?? []).includes(filters.assignee)) return false;
      if (filters.repository !== "" && i.repository !== filters.repository) return false;
      if (filters.labels.length > 0 && !filters.labels.some((l) => (i.labels ?? []).includes(l)))
        return false;
      if (
        filters.oneDayOnly &&
        !(i.closedAt !== null && i.closedAt.slice(0, 10) === i.createdAt.slice(0, 10))
      )
        return false;
      return true;
    });
  }
}
