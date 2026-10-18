import type { z } from "zod";

import type { issueOriginEntrySchema } from "../schemas/issue-origin-entry.schema.js";

export type IssueOriginEntry = z.infer<typeof issueOriginEntrySchema>;
