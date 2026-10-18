import { issuesQuerySchema } from "./issues-query.schema.js";

describe("issuesQuerySchema", () => {
  it("defaults every field when the query is empty", () => {
    expect(issuesQuerySchema.parse({})).toEqual({
      type: "all",
      title: "",
      state: "all",
      author: "",
      assignee: "",
      repository: "",
      labels: [],
      oneDayOnly: false,
    });
  });

  it("parses the provided values", () => {
    expect(
      issuesQuerySchema.parse({
        type: "pr",
        title: "Fix",
        state: "open",
        author: "alice",
        assignee: "bob",
        repository: "o/r",
        labels: "bug",
        oneDayOnly: "true",
      }),
    ).toEqual({
      type: "pr",
      title: "Fix",
      state: "open",
      author: "alice",
      assignee: "bob",
      repository: "o/r",
      labels: ["bug"],
      oneDayOnly: true,
    });
  });

  describe("labels", () => {
    it("splits a comma-separated value", () => {
      expect(issuesQuerySchema.parse({ labels: "a,b" }).labels).toEqual(["a", "b"]);
    });

    it("gives an empty array for an empty value", () => {
      expect(issuesQuerySchema.parse({ labels: "" }).labels).toEqual([]);
    });

    it("gives an empty array when absent", () => {
      expect(issuesQuerySchema.parse({}).labels).toEqual([]);
    });

    it("drops empty segments", () => {
      expect(issuesQuerySchema.parse({ labels: "a,,b," }).labels).toEqual(["a", "b"]);
    });

    it("trims whitespace around each label and drops blank segments", () => {
      expect(issuesQuerySchema.parse({ labels: " a , b ,  " }).labels).toEqual(["a", "b"]);
    });

    it("keeps whitespace inside a label", () => {
      expect(issuesQuerySchema.parse({ labels: "good first issue,bug" }).labels).toEqual([
        "good first issue",
        "bug",
      ]);
    });

    it("rejects a repeated parameter", () => {
      expect(issuesQuerySchema.safeParse({ labels: ["a", "b"] }).success).toBe(false);
    });
  });

  describe("oneDayOnly", () => {
    it("parses true", () => {
      expect(issuesQuerySchema.parse({ oneDayOnly: "true" }).oneDayOnly).toBe(true);
    });

    it("parses false", () => {
      expect(issuesQuerySchema.parse({ oneDayOnly: "false" }).oneDayOnly).toBe(false);
    });

    it("rejects other values", () => {
      expect(issuesQuerySchema.safeParse({ oneDayOnly: "maybe" }).success).toBe(false);
    });
  });

  it("rejects an invalid type", () => {
    expect(issuesQuerySchema.safeParse({ type: "foo" }).success).toBe(false);
  });

  it("rejects an invalid state", () => {
    expect(issuesQuerySchema.safeParse({ state: "merged" }).success).toBe(false);
  });
});
