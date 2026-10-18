import type { z } from "zod";

import type { issuesQuerySchema } from "../schemas/issues-query.schema.js";

export type IssuesQuery = z.infer<typeof issuesQuerySchema>;
