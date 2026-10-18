import type { z } from "zod";

import type { quickCloseByDaySchema } from "../schemas/quick-close-response.schema.js";

export type QuickCloseByDay = z.infer<typeof quickCloseByDaySchema>;
