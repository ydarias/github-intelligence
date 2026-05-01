import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export type OctokitUserData = RestEndpointMethodTypes["users"]["getByUsername"]["response"]["data"];
