import { DEFAULT_FILTERS } from "./default-filters.js";
import { IssuesQueryBuilder } from "./issues-query-builder.js";
import type { SearchFilters } from "./types/search-filters.js";

function build(overrides: Partial<SearchFilters> = {}): string {
  return new IssuesQueryBuilder().build({ ...DEFAULT_FILTERS, ...overrides });
}

describe("IssuesQueryBuilder", () => {
  it("returns an empty query for the default filters", () => {
    expect(build()).toBe("");
  });

  it("maps each filter to its param", () => {
    const params = new URLSearchParams(
      build({
        type: "pr",
        title: "bug",
        state: "open",
        author: "alice",
        assignee: "bob",
        labels: ["a"],
        oneDayOnly: true,
      }),
    );

    expect(Object.fromEntries(params)).toEqual({
      type: "pr",
      title: "bug",
      state: "open",
      author: "alice",
      assignee: "bob",
      labels: "a",
      oneDayOnly: "true",
    });
  });

  it("joins labels with a comma", () => {
    expect(new URLSearchParams(build({ labels: ["a", "b"] })).get("labels")).toBe("a,b");
  });

  it("omits labels when the array is empty", () => {
    expect(build({ labels: [] })).toBe("");
  });

  it("omits oneDayOnly when false and sends true when set", () => {
    expect(build({ oneDayOnly: false })).toBe("");
    expect(build({ oneDayOnly: true })).toBe("oneDayOnly=true");
  });

  it("encodes special characters", () => {
    const query = build({ title: "fix a&b", labels: ["good first issue"] });

    expect(query).not.toContain("&b");
    expect(query).not.toContain(" ");
    const params = new URLSearchParams(query);
    expect(params.get("title")).toBe("fix a&b");
    expect(params.get("labels")).toBe("good first issue");
  });
});
