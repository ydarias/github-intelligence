import type { DateWindow } from "../search/date-window.js";

export interface SearchProgressListener {
  onWindowFetched(window: DateWindow, fetched: number, total: number): void;
  onWindowTruncated(window: DateWindow, totalCount: number): void;
}
