import type { z } from "zod";

import type { throughputResponseSchema } from "../schemas/throughput-response.schema.js";

export type ThroughputResponse = z.infer<typeof throughputResponseSchema>;
