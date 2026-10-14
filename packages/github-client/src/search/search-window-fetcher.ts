import type { IdentifiableItem } from "../types/identifiable-item.js";
import type { SearchPort } from "../types/search-port.js";
import type { SearchProgressListener } from "../types/search-progress-listener.js";

import type { DateWindow } from "./date-window.js";

export class SearchWindowFetcher<T extends IdentifiableItem> {
  private static readonly MAX_RESULTS_PER_QUERY = 1000;

  private readonly itemsById = new Map<number, T>();

  constructor(
    private readonly port: SearchPort<T>,
    private readonly listener?: SearchProgressListener,
  ) {}

  async fetch(window: DateWindow): Promise<T[]> {
    this.itemsById.clear();
    await this.collect(window);
    return [...this.itemsById.values()];
  }

  private async collect(window: DateWindow): Promise<void> {
    const totalCount = await this.port.count(window);
    if (totalCount === 0) {
      return;
    }

    const exceedsCap = totalCount > SearchWindowFetcher.MAX_RESULTS_PER_QUERY;
    if (exceedsCap && !window.isSingleDay()) {
      const [firstHalf, secondHalf] = window.split();
      await this.collect(firstHalf);
      await this.collect(secondHalf);
      return;
    }

    if (exceedsCap) {
      this.listener?.onWindowTruncated(window, totalCount);
    }

    const items = await this.port.fetchAll(window);
    for (const item of items) {
      this.itemsById.set(item.id, item);
    }
    this.listener?.onWindowFetched(window, items.length, this.itemsById.size);
  }
}
