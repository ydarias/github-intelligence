import type { z } from "zod";

import type { timeToClosePercentilesSchema } from "../schemas/issue-stats.schema.js";

export type TimeToClosePercentiles = z.infer<typeof timeToClosePercentilesSchema>;
