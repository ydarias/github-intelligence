import type { IssueOriginEntry } from "../types/issue-origin-entry.js";

import { issueOriginEntrySchema } from "./issue-origin-entry.schema.js";

const entry: IssueOriginEntry = {
  login: "alice",
  name: "Alice Smith",
  total: 3,
  open: 1,
  closed: 2,
  percentage: 33.3,
};

describe("issueOriginEntrySchema", () => {
  it("parses an entry unchanged", () => {
    expect(issueOriginEntrySchema.parse(entry)).toEqual(entry);
  });

  it("accepts a null name", () => {
    expect(issueOriginEntrySchema.parse({ ...entry, name: null })).toEqual({
      ...entry,
      name: null,
    });
  });

  it("rejects an entry with a wrong field type", () => {
    expect(issueOriginEntrySchema.safeParse({ ...entry, total: "3" }).success).toBe(false);
  });
});
