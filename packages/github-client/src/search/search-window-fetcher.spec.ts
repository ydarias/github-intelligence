import type { SearchPort } from "../types/search-port.js";
import type { SearchProgressListener } from "../types/search-progress-listener.js";

import { DateWindow } from "./date-window.js";
import { SearchWindowFetcher } from "./search-window-fetcher.js";

interface FakeItem {
  id: number;
  day: string;
}

class FakeSearchPort implements SearchPort<FakeItem> {
  readonly countedWindows: string[] = [];
  readonly fetchedWindows: string[] = [];

  constructor(private readonly items: FakeItem[]) {}

  async count(window: DateWindow): Promise<number> {
    this.countedWindows.push(window.toString());
    return this.itemsIn(window).length;
  }

  async fetchAll(window: DateWindow): Promise<FakeItem[]> {
    this.fetchedWindows.push(window.toString());
    return this.itemsIn(window).slice(0, 1000);
  }

  private itemsIn(window: DateWindow): FakeItem[] {
    return this.items.filter((item) => item.day >= window.from && item.day <= window.to);
  }
}

class RecordingListener implements SearchProgressListener {
  readonly fetched: { window: string; fetched: number; total: number }[] = [];
  readonly truncated: { window: string; totalCount: number }[] = [];

  onWindowFetched(window: DateWindow, fetched: number, total: number): void {
    this.fetched.push({ window: window.toString(), fetched, total });
  }

  onWindowTruncated(window: DateWindow, totalCount: number): void {
    this.truncated.push({ window: window.toString(), totalCount });
  }
}

function itemsOn(day: string, count: number, firstId: number): FakeItem[] {
  return Array.from({ length: count }, (_, i) => ({ id: firstId + i, day }));
}

function january(): DateWindow {
  return DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-31"));
}

describe("SearchWindowFetcher", () => {
  it("fetches the whole range in one request when it has at most 1000 items", async () => {
    const port = new FakeSearchPort(itemsOn("2024-01-10", 1000, 1));
    const fetcher = new SearchWindowFetcher(port);

    const items = await fetcher.fetch(january());

    expect(items).toHaveLength(1000);
    expect(port.countedWindows).toEqual(["2024-01-01..2024-01-31"]);
    expect(port.fetchedWindows).toEqual(["2024-01-01..2024-01-31"]);
  });

  it("splits the range until every window has at most 1000 items and returns all of them", async () => {
    const items = [
      ...itemsOn("2024-01-03", 700, 1),
      ...itemsOn("2024-01-12", 700, 1001),
      ...itemsOn("2024-01-25", 700, 2001),
    ];
    const port = new FakeSearchPort(items);
    const fetcher = new SearchWindowFetcher(port);

    const result = await fetcher.fetch(january());

    expect(result).toHaveLength(2100);
    expect(port.fetchedWindows).not.toContain("2024-01-01..2024-01-31");
  });

  it("keeps splitting nested windows that still have more than 1000 items", async () => {
    const items = [
      ...itemsOn("2024-01-01", 600, 1),
      ...itemsOn("2024-01-02", 600, 1001),
      ...itemsOn("2024-01-20", 100, 2001),
    ];
    const port = new FakeSearchPort(items);
    const fetcher = new SearchWindowFetcher(port);

    const result = await fetcher.fetch(january());

    expect(result).toHaveLength(1300);
    expect(port.fetchedWindows).toContain("2024-01-01..2024-01-01");
    expect(port.fetchedWindows).toContain("2024-01-02..2024-01-02");
  });

  it("fetches windows that cover the whole range without overlapping", async () => {
    const items = [
      ...itemsOn("2024-01-01", 800, 1),
      ...itemsOn("2024-01-16", 800, 1001),
      ...itemsOn("2024-01-31", 800, 2001),
    ];
    const port = new FakeSearchPort(items);
    const fetcher = new SearchWindowFetcher(port);

    await fetcher.fetch(january());

    const fetchedDays = port.fetchedWindows.flatMap((label) => {
      const [from = "", to = ""] = label.split("..");
      const days: string[] = [];
      for (let ms = Date.parse(from); ms <= Date.parse(to); ms += 86_400_000) {
        days.push(new Date(ms).toISOString().slice(0, 10));
      }
      return days;
    });
    expect(fetchedDays).toHaveLength(31);
    expect(new Set(fetchedDays).size).toBe(31);
  });

  it("returns the first 1000 items and warns when a single day has more than 1000", async () => {
    const items = [...itemsOn("2024-01-01", 1200, 1), ...itemsOn("2024-01-02", 10, 2001)];
    const port = new FakeSearchPort(items);
    const listener = new RecordingListener();
    const fetcher = new SearchWindowFetcher(port, listener);

    const result = await fetcher.fetch(
      DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-02")),
    );

    expect(result).toHaveLength(1010);
    expect(listener.truncated).toEqual([{ window: "2024-01-01..2024-01-01", totalCount: 1200 }]);
  });

  it("removes items returned in more than one window", async () => {
    const items = [
      ...itemsOn("2024-01-01", 600, 1),
      ...itemsOn("2024-01-31", 600, 1001),
      { id: 1, day: "2024-01-31" },
    ];
    const port = new FakeSearchPort(items);
    const fetcher = new SearchWindowFetcher(port);

    const result = await fetcher.fetch(january());

    expect(result).toHaveLength(1200);
  });

  it("reports each fetched window with a running total", async () => {
    const items = [...itemsOn("2024-01-01", 600, 1), ...itemsOn("2024-01-31", 500, 1001)];
    const port = new FakeSearchPort(items);
    const listener = new RecordingListener();
    const fetcher = new SearchWindowFetcher(port, listener);

    await fetcher.fetch(january());

    expect(listener.fetched).toEqual([
      { window: "2024-01-01..2024-01-16", fetched: 600, total: 600 },
      { window: "2024-01-17..2024-01-31", fetched: 500, total: 1100 },
    ]);
  });

  it("skips the fetch request for windows without items", async () => {
    const port = new FakeSearchPort([]);
    const fetcher = new SearchWindowFetcher(port);

    const result = await fetcher.fetch(january());

    expect(result).toEqual([]);
    expect(port.fetchedWindows).toEqual([]);
  });

  it("returns fresh results on every call", async () => {
    const port = new FakeSearchPort(itemsOn("2024-01-10", 5, 1));
    const fetcher = new SearchWindowFetcher(port);

    await fetcher.fetch(january());
    const second = await fetcher.fetch(january());

    expect(second).toHaveLength(5);
  });
});
