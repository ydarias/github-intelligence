import type { SearchProgressListener } from "@github-intelligence/github-client";

export interface FetchIssuesOptions {
  owner: string;
  repo: string;
  from: Date;
  to: Date;
  listener?: SearchProgressListener;
}
