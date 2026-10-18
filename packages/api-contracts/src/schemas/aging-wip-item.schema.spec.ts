import type { AgingWipItem } from "../types/aging-wip-item.js";

import { agingWipItemSchema } from "./aging-wip-item.schema.js";

const item: AgingWipItem = {
  id: 1,
  number: 10,
  title: "Fix bug",
  url: "https://github.com/o/r/issues/10",
  repository: "o/r",
  type: "issue",
  ageDays: 12,
  author: "octocat",
  assignees: ["hubot"],
  labels: ["bug"],
};

describe("agingWipItemSchema", () => {
  it("parses a realistic item unchanged, without stripping any field", () => {
    expect(agingWipItemSchema.parse(item)).toEqual(item);
  });

  it("parses an item with no assignees nor labels", () => {
    const bare = { ...item, assignees: [], labels: [] };

    expect(agingWipItemSchema.parse(bare)).toEqual(bare);
  });

  it("rejects an item with an unknown type", () => {
    expect(agingWipItemSchema.safeParse({ ...item, type: "other" }).success).toBe(false);
  });

  it("rejects an item with a missing field", () => {
    expect(agingWipItemSchema.safeParse({ ...item, ageDays: undefined }).success).toBe(false);
  });
});
