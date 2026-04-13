import type { IssueStats } from "../types.js";

interface Props {
  stats: IssueStats;
}

export function StatsSummary({ stats }: Props) {
  return (
    <dl style={{ display: "flex", gap: "32px", margin: "16px 0" }}>
      <div>
        <dt>Total</dt>
        <dd style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.total}</dd>
      </div>
      <div>
        <dt>Open</dt>
        <dd style={{ fontSize: "1.5rem", fontWeight: "bold", color: "green" }}>{stats.open}</dd>
      </div>
      <div>
        <dt>Closed</dt>
        <dd style={{ fontSize: "1.5rem", fontWeight: "bold", color: "purple" }}>{stats.closed}</dd>
      </div>
    </dl>
  );
}
