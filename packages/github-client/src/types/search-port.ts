import type { DateWindow } from "../search/date-window.js";

import type { IdentifiableItem } from "./identifiable-item.js";

export interface SearchPort<T extends IdentifiableItem> {
  count(window: DateWindow): Promise<number>;
  fetchAll(window: DateWindow): Promise<T[]>;
}
