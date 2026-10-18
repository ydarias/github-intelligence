import type { z } from "zod";

import type { monthlyTimeToCloseSchema } from "../schemas/issue-stats.schema.js";

export type MonthlyTimeToClose = z.infer<typeof monthlyTimeToCloseSchema>;
