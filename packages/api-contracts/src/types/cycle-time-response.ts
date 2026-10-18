import type { z } from "zod";

import type { cycleTimeResponseSchema } from "../schemas/cycle-time-response.schema.js";

export type CycleTimeResponse = z.infer<typeof cycleTimeResponseSchema>;
