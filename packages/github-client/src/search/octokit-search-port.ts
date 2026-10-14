import type { Octokit } from "@octokit/rest";

import type { OctokitSearchItem } from "../types/octokit-search-item.js";
import type { SearchPort } from "../types/search-port.js";

import type { DateWindow } from "./date-window.js";

export class OctokitSearchPort implements SearchPort<OctokitSearchItem> {
  constructor(
    private readonly octokit: Octokit,
    private readonly baseQuery: string,
  ) {}

  async count(window: DateWindow): Promise<number> {
    const { data } = await this.octokit.rest.search.issuesAndPullRequests({
      q: this.queryFor(window),
      per_page: 1,
    });
    return data.total_count;
  }

  async fetchAll(window: DateWindow): Promise<OctokitSearchItem[]> {
    return this.octokit.paginate(this.octokit.rest.search.issuesAndPullRequests, {
      q: this.queryFor(window),
      per_page: 100,
    });
  }

  private queryFor(window: DateWindow): string {
    return `${this.baseQuery} ${window.toQualifier()}`;
  }
}
