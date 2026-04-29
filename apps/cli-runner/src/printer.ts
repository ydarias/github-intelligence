import type { GitHubIssue } from "@github-intelligence/issues-collector";
import type { OrgMember } from "@github-intelligence/members-collector";

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

  static printMembersTable(members: OrgMember[]): void {
    if (members.length === 0) {
      console.log("No members found.");
      return;
    }

    const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);

    const COL_LOGIN = Math.max(5, Math.max(...members.map((m) => m.login.length)));
    const COL_NAME = Math.max(4, Math.max(...members.map((m) => (m.name ?? "—").length)));
    const COL_EMAIL = Math.max(5, Math.max(...members.map((m) => (m.email ?? "—").length)));
    const COL_TALENT = Math.max(9, Math.max(...members.map((m) => (m.talentId ?? "—").length)));
    const COL_ROLE = Math.max(8, Math.max(...members.map((m) => (m.jobRole ?? "—").length)));
    const COL_CREATED = 10;

    const header =
      pad("Login", COL_LOGIN) + "  " +
      pad("Name", COL_NAME) + "  " +
      pad("Email", COL_EMAIL) + "  " +
      pad("Talent ID", COL_TALENT) + "  " +
      pad("Job Role", COL_ROLE) + "  " +
      "Created";

    const divider = "-".repeat(header.length + COL_CREATED - 7);

    console.log("\n" + header);
    console.log(divider);

    for (const member of members) {
      console.log(
        pad(member.login, COL_LOGIN) + "  " +
        pad(member.name ?? "—", COL_NAME) + "  " +
        pad(member.email ?? "—", COL_EMAIL) + "  " +
        pad(member.talentId ?? "—", COL_TALENT) + "  " +
        pad(member.jobRole ?? "—", COL_ROLE) + "  " +
        member.createdAt.slice(0, 10)
      );
    }
  }
}
