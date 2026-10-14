import { DateWindow } from "./date-window.js";

describe("DateWindow", () => {
  it("builds a window from dates using their UTC calendar day", () => {
    const window = DateWindow.fromDates(
      new Date("2024-01-01T15:30:00Z"),
      new Date("2024-01-31T23:59:59Z"),
    );

    expect(window.from).toBe("2024-01-01");
    expect(window.to).toBe("2024-01-31");
  });

  it("formats the search qualifier with inclusive date bounds", () => {
    const window = DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-31"));

    expect(window.toQualifier()).toBe("created:2024-01-01..2024-01-31");
  });

  it("formats a readable label", () => {
    const window = DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-31"));

    expect(window.toString()).toBe("2024-01-01..2024-01-31");
  });

  it("is a single day when both bounds are the same day", () => {
    const window = DateWindow.fromDates(new Date("2024-03-10"), new Date("2024-03-10"));

    expect(window.isSingleDay()).toBe(true);
  });

  it("is not a single day when bounds differ", () => {
    const window = DateWindow.fromDates(new Date("2024-03-10"), new Date("2024-03-11"));

    expect(window.isSingleDay()).toBe(false);
  });

  it("splits an even number of days into two equal halves", () => {
    const window = DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-04"));

    const [first, second] = window.split();

    expect(first.toString()).toBe("2024-01-01..2024-01-02");
    expect(second.toString()).toBe("2024-01-03..2024-01-04");
  });

  it("splits an odd number of days giving the extra day to the first half", () => {
    const window = DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-05"));

    const [first, second] = window.split();

    expect(first.toString()).toBe("2024-01-01..2024-01-03");
    expect(second.toString()).toBe("2024-01-04..2024-01-05");
  });

  it("splits a two-day window into two single days", () => {
    const window = DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-02"));

    const [first, second] = window.split();

    expect(first.isSingleDay()).toBe(true);
    expect(second.isSingleDay()).toBe(true);
    expect(first.from).toBe("2024-01-01");
    expect(second.from).toBe("2024-01-02");
  });

  it("splits across month and leap-year boundaries", () => {
    const window = DateWindow.fromDates(new Date("2024-02-28"), new Date("2024-03-01"));

    const [first, second] = window.split();

    expect(first.toString()).toBe("2024-02-28..2024-02-29");
    expect(second.toString()).toBe("2024-03-01..2024-03-01");
  });

  it("refuses to split a single-day window", () => {
    const window = DateWindow.fromDates(new Date("2024-01-01"), new Date("2024-01-01"));

    expect(() => window.split()).toThrow("Cannot split a single-day window");
  });
});
