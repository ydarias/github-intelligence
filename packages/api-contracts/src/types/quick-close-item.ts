import type { z } from "zod";

import type { quickCloseItemSchema } from "../schemas/quick-close-response.schema.js";

export type QuickCloseItem = z.infer<typeof quickCloseItemSchema>;
