import type { QuickCloseResponse } from "../types/quick-close-response.js";

import { quickCloseResponseSchema } from "./quick-close-response.schema.js";

const response: QuickCloseResponse = {
  byDay: [{ date: "2026-01-01", count: 2 }],
  items: [
    {
      id: 1,
      number: 1,
      repository: "o/r",
      title: "Fix bug",
      url: "https://github.com/o/r/issues/1",
    },
    { id: 2, number: 2, repository: "o/r", title: "Typo", url: "https://github.com/o/r/issues/2" },
  ],
};

describe("quickCloseResponseSchema", () => {
  it("parses a realistic response unchanged, without stripping any field", () => {
    expect(quickCloseResponseSchema.parse(response)).toEqual(response);
  });

  it("parses an empty response", () => {
    const empty = { byDay: [], items: [] };

    expect(quickCloseResponseSchema.parse(empty)).toEqual(empty);
  });

  it("rejects a day with a missing count", () => {
    const invalid = { byDay: [{ date: "2026-01-01" }], items: [] };

    expect(quickCloseResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects an item with a missing field", () => {
    const invalid = { byDay: [], items: [{ id: 1 }] };

    expect(quickCloseResponseSchema.safeParse(invalid).success).toBe(false);
  });
});
