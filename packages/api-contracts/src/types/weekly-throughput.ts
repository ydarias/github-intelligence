import type { z } from "zod";

import type { weeklyThroughputSchema } from "../schemas/throughput-response.schema.js";

export type WeeklyThroughput = z.infer<typeof weeklyThroughputSchema>;
