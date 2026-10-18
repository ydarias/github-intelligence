import type { z } from "zod";

import type { issueFilterOptionsSchema } from "../schemas/issues-response.schema.js";

export type IssueFilterOptions = z.infer<typeof issueFilterOptionsSchema>;
