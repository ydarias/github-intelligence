import type { DateWindow, SearchProgressListener } from "@github-intelligence/issues";

export class ConsoleProgressListener implements SearchProgressListener {
  onWindowFetched(window: DateWindow, fetched: number, total: number): void {
    console.log(`Fetched ${window.toString()}: ${fetched} items (total ${total})`);
  }

  onWindowTruncated(window: DateWindow, totalCount: number): void {
    console.warn(
      `Warning: ${window.from} has ${totalCount} items, only the first 1000 will be fetched`,
    );
  }
}
