import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export type OctokitSearchItem =
  RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["response"]["data"]["items"][number];
