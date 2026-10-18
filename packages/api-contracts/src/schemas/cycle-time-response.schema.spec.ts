import type { CycleTimeResponse } from "../types/cycle-time-response.js";

import { cycleTimeResponseSchema } from "./cycle-time-response.schema.js";

const response: CycleTimeResponse = {
  items: [
    {
      id: 1,
      title: "Fix bug",
      url: "https://github.com/o/r/issues/1",
      repository: "o/r",
      type: "issue",
      closeDate: "2026-01-06",
      cycleDays: 5,
    },
    {
      id: 2,
      title: "Add feature",
      url: "https://github.com/o/r/pull/2",
      repository: "o/r",
      type: "pr",
      closeDate: "2026-01-08",
      cycleDays: 0,
    },
  ],
};

describe("cycleTimeResponseSchema", () => {
  it("parses a realistic response unchanged, without stripping any field", () => {
    expect(cycleTimeResponseSchema.parse(response)).toEqual(response);
  });

  it("parses an empty response", () => {
    expect(cycleTimeResponseSchema.parse({ items: [] })).toEqual({ items: [] });
  });

  it("rejects an item with an unknown type", () => {
    const invalid = { items: [{ ...response.items[0], type: "other" }] };

    expect(cycleTimeResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects an item with a missing field", () => {
    const invalid = { items: [{ id: 1, title: "x" }] };

    expect(cycleTimeResponseSchema.safeParse(invalid).success).toBe(false);
  });
});
