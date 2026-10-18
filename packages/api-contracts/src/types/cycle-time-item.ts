import type { z } from "zod";

import type { cycleTimeItemSchema } from "../schemas/cycle-time-response.schema.js";

export type CycleTimeItem = z.infer<typeof cycleTimeItemSchema>;
