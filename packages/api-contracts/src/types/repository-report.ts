import type { z } from "zod";

import type { repositoryReportSchema } from "../schemas/report-response.schema.js";

export type RepositoryReport = z.infer<typeof repositoryReportSchema>;
