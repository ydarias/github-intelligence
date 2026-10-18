import type { SearchFilters } from "./types/search-filters.js";

export const DEFAULT_FILTERS: SearchFilters = {
  type: "all",
  title: "",
  state: "all",
  author: "",
  assignee: "",
  repository: "",
  labels: [],
  oneDayOnly: false,
};
