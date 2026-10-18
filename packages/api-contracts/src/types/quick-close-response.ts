import type { z } from "zod";

import type { quickCloseResponseSchema } from "../schemas/quick-close-response.schema.js";

export type QuickCloseResponse = z.infer<typeof quickCloseResponseSchema>;
