export interface SearchFilters {
  type: "all" | "issue" | "pr";
  title: string;
  state: "all" | "open" | "closed";
  author: string;
  assignee: string;
  labels: string[];
  oneDayOnly: boolean;
}
