import type { GitHubIssueDTO, IssueOriginEntry, OrgMember } from "./types.js";

export function computeIssueOrigins(
  items: GitHubIssueDTO[],
  members: OrgMember[],
): IssueOriginEntry[] {
  const membersByLogin = new Map<string, OrgMember>(members.map((m) => [m.login, m]));

  const byLogin = new Map<string, { open: number; closed: number }>();
  for (const item of items) {
    const entry = byLogin.get(item.author) ?? { open: 0, closed: 0 };
    if (item.state === "open") {
      entry.open += 1;
    } else {
      entry.closed += 1;
    }
    byLogin.set(item.author, entry);
  }

  return Array.from(byLogin.entries())
    .map(([login, counts]) => {
      const total = counts.open + counts.closed;
      const percentage =
        items.length > 0 ? Math.round((total / items.length) * 1000) / 10 : 0;
      return {
        login,
        name: membersByLogin.get(login)?.name ?? null,
        total,
        open: counts.open,
        closed: counts.closed,
        percentage,
      };
    })
    .sort((a, b) => b.total - a.total);
}
