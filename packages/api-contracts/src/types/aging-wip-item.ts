import type { z } from "zod";

import type { agingWipItemSchema } from "../schemas/aging-wip-item.schema.js";

export type AgingWipItem = z.infer<typeof agingWipItemSchema>;
