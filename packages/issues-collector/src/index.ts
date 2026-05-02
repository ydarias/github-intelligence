export { IssuesCollector } from "./collectors/issues-collector.js";
export {
  FlatCacheIssuesRepository,
  type IssuesRepository,
} from "./repositories/issues-repository.js";
export { PullRequestsCollector } from "./collectors/pull-requests-collector.js";
export {
  FlatCachePullRequestsRepository,
  type PullRequestsRepository,
} from "./repositories/pull-requests-repository.js";
export type { GithubIssue } from "@github-intelligence/github-client";
export { FetchIssuesOptions } from "./types/fetchIssuesOptions.js";
