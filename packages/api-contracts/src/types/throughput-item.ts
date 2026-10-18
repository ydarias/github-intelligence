import type { z } from "zod";

import type { throughputItemSchema } from "../schemas/throughput-response.schema.js";

export type ThroughputItem = z.infer<typeof throughputItemSchema>;
