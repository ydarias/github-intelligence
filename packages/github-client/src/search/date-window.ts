export class DateWindow {
  private static readonly DAY_MS = 24 * 60 * 60 * 1000;

  private constructor(
    readonly from: string,
    readonly to: string,
  ) {}

  static fromDates(from: Date, to: Date): DateWindow {
    return new DateWindow(DateWindow.toDay(from), DateWindow.toDay(to));
  }

  isSingleDay(): boolean {
    return this.from === this.to;
  }

  split(): [DateWindow, DateWindow] {
    if (this.isSingleDay()) {
      throw new Error("Cannot split a single-day window");
    }

    const fromMs = DateWindow.toMs(this.from);
    const dayCount = (DateWindow.toMs(this.to) - fromMs) / DateWindow.DAY_MS + 1;
    const firstHalfDays = Math.ceil(dayCount / 2);
    const firstEnd = new Date(fromMs + (firstHalfDays - 1) * DateWindow.DAY_MS);
    const secondStart = new Date(fromMs + firstHalfDays * DateWindow.DAY_MS);

    return [
      new DateWindow(this.from, DateWindow.toDay(firstEnd)),
      new DateWindow(DateWindow.toDay(secondStart), this.to),
    ];
  }

  toQualifier(): string {
    return `created:${this.toString()}`;
  }

  toString(): string {
    return `${this.from}..${this.to}`;
  }

  private static toDay(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private static toMs(day: string): number {
    return Date.parse(`${day}T00:00:00Z`);
  }
}
