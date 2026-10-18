import type { z } from "zod";

import type { reportResponseSchema } from "../schemas/report-response.schema.js";

export type ReportResponse = z.infer<typeof reportResponseSchema>;
