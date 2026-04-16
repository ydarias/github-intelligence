import type { GitHubIssue } from "@github-intelligence/issues-collector";

export class Printer {
  static printIssuesTable(issues: GitHubIssue[]): void {
    if (issues.length === 0) {
      console.log("No issues found.");
      return;
    }

    const COL_TYPE = 6;
    const COL_NUM = 6;
    const COL_STATE = 8;
    const titleWidth = Math.max(
      10,
      Math.min(60, Math.max(...issues.map((i) => i.title.length)))
    );
    const authorWidth = Math.max(
      6,
      Math.max(...issues.map((i) => i.author.length))
    );
    const assigneesWidth = Math.max(
      9,
      Math.max(...issues.map((i) => (i.assignees.length ? i.assignees.join(", ").length : 1)))
    );

    const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);

    const header =
      pad("Type", COL_TYPE) +
      "  " +
      pad("#", COL_NUM) +
      "  " +
      pad("Title", titleWidth) +
      "  " +
      pad("State", COL_STATE) +
      "  " +
      pad("Author", authorWidth) +
      "  " +
      pad("Assignees", assigneesWidth);

    const divider = "-".repeat(header.length);

    console.log(header);
    console.log(divider);

    for (const issue of issues) {
      console.log(
        pad(issue.type, COL_TYPE) +
          "  " +
          pad(String(issue.number), COL_NUM) +
          "  " +
          pad(issue.title, titleWidth) +
          "  " +
          pad(issue.state, COL_STATE) +
          "  " +
          pad(issue.author, authorWidth) +
          "  " +
          pad(issue.assignees.length ? issue.assignees.join(", ") : "—", assigneesWidth)
      );
    }
  }
}
