import type { z } from "zod";

import type { reportDaySchema } from "../schemas/report-response.schema.js";

export type ReportDay = z.infer<typeof reportDaySchema>;
