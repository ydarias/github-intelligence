import { DEFAULT_FILTERS } from "./default-filters.js";
import type { SearchFilters } from "./types/search-filters.js";

type StringFilterKey = "type" | "title" | "state" | "author" | "assignee";

export class IssuesQueryBuilder {
  private static readonly STRING_KEYS: StringFilterKey[] = [
    "type",
    "title",
    "state",
    "author",
    "assignee",
  ];

  build(filters: SearchFilters): string {
    const params = new URLSearchParams();

    for (const key of IssuesQueryBuilder.STRING_KEYS) {
      if (filters[key] !== DEFAULT_FILTERS[key]) {
        params.set(key, filters[key]);
      }
    }

    if (filters.labels.length > 0) {
      params.set("labels", filters.labels.join(","));
    }

    if (filters.oneDayOnly) {
      params.set("oneDayOnly", "true");
    }

    return params.toString();
  }
}
