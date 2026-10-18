import type { ReportResponse } from "../types/report-response.js";

import { reportResponseSchema } from "./report-response.schema.js";

const response: ReportResponse = {
  repositories: [
    {
      repository: "o/r",
      byDay: [
        { date: "2026-01-01", issues: 1, prs: 0 },
        { date: "2026-01-02", issues: 1, prs: 2 },
      ],
    },
  ],
};

describe("reportResponseSchema", () => {
  it("parses a realistic response unchanged, without stripping any field", () => {
    expect(reportResponseSchema.parse(response)).toEqual(response);
  });

  it("parses an empty response", () => {
    expect(reportResponseSchema.parse({ repositories: [] })).toEqual({ repositories: [] });
  });

  it("parses a repository with no days", () => {
    const noDays = { repositories: [{ repository: "o/r", byDay: [] }] };

    expect(reportResponseSchema.parse(noDays)).toEqual(noDays);
  });

  it("rejects a day with a missing field", () => {
    const invalid = {
      repositories: [{ repository: "o/r", byDay: [{ date: "2026-01-01", issues: 1 }] }],
    };

    expect(reportResponseSchema.safeParse(invalid).success).toBe(false);
  });
});
