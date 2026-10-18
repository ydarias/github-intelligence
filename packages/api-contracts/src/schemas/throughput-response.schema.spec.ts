import type { ThroughputResponse } from "../types/throughput-response.js";

import { throughputResponseSchema } from "./throughput-response.schema.js";

const response: ThroughputResponse = {
  byWeek: [
    {
      week: "2026-01-05",
      issues: 1,
      prs: 1,
      items: [
        {
          id: 1,
          title: "Fix bug",
          url: "https://github.com/o/r/issues/1",
          repository: "o/r",
          type: "issue",
        },
        {
          id: 2,
          title: "Add feature",
          url: "https://github.com/o/r/pull/2",
          repository: "o/r",
          type: "pr",
        },
      ],
    },
    { week: "2026-01-12", issues: 0, prs: 0, items: [] },
  ],
};

describe("throughputResponseSchema", () => {
  it("parses a realistic response unchanged, without stripping any field", () => {
    expect(throughputResponseSchema.parse(response)).toEqual(response);
  });

  it("parses an empty response", () => {
    expect(throughputResponseSchema.parse({ byWeek: [] })).toEqual({ byWeek: [] });
  });

  it("rejects an item with an unknown type", () => {
    const invalid = {
      byWeek: [
        {
          week: "2026-01-05",
          issues: 1,
          prs: 0,
          items: [{ ...response.byWeek[0]?.items[0], type: "other" }],
        },
      ],
    };

    expect(throughputResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects a week with a missing field", () => {
    expect(
      throughputResponseSchema.safeParse({ byWeek: [{ week: "2026-01-05", issues: 1, items: [] }] })
        .success,
    ).toBe(false);
  });
});
