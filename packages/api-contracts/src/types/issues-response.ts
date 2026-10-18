import type { z } from "zod";

import type { issuesResponseSchema } from "../schemas/issues-response.schema.js";

export type IssuesResponse = z.infer<typeof issuesResponseSchema>;
