import type { z } from "zod";

import type { githubIssueSchema } from "../schemas/github-issue.schema.js";

export type GithubIssue = z.infer<typeof githubIssueSchema>;
