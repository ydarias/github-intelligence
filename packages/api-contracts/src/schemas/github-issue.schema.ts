import { z } from "zod";

// Must list every field of the `GithubIssue` domain type: z.object strips unknown keys.
// Issues and pull requests share the same type, told apart by `type`.
export const githubIssueSchema = z.object({
  id: z.number(),
  number: z.number(),
  repository: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  state: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  closedAt: z.string().nullable(),
  url: z.string(),
  labels: z.array(z.string()),
  author: z.string(),
  assignees: z.array(z.string()),
  type: z.enum(["issue", "pr"]),
});
