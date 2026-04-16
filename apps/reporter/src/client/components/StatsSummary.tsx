import type { IssueStats } from "../types.js";

interface Props {
  stats: IssueStats;
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function StatsSummary({ stats }: Props) {
  return (
    <div style={{ border: "1px solid #eaeaea", borderRadius: "8px" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #eaeaea" }}>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666" }}>Stats</span>
      </div>

      <div style={{ padding: "16px" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "0.875rem", width: "100%" }}>
          <thead>
            <tr>
              <th style={headerCell}></th>
              <th style={headerCell}>Total</th>
              <th style={headerCell}>Open</th>
              <th style={headerCell}>Closed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...labelCell, fontWeight: 500 }}>Issues</td>
              <td style={valueCell}>{stats.total}</td>
              <td style={valueCell}>{stats.open}</td>
              <td style={valueCell}>{stats.closed}</td>
            </tr>
            <tr>
              <td style={{ ...labelCell, fontWeight: 500 }}>PRs</td>
              <td style={valueCell}>{stats.totalPRs}</td>
              <td style={valueCell}>{stats.openPRs}</td>
              <td style={valueCell}>{stats.closedPRs}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: "flex", gap: "32px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eaeaea" }}>
          <div>
            <div style={extraLabel}>Avg time to close</div>
            <div style={extraValue}>
              {stats.avgTimeToCloseHours !== null ? formatHours(stats.avgTimeToCloseHours) : "—"}
            </div>
          </div>
          <div>
            <div style={extraLabel}>Median time to close</div>
            <div style={extraValue}>
              {stats.medianTimeToCloseHours !== null ? formatHours(stats.medianTimeToCloseHours) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const headerCell: React.CSSProperties = {
  textAlign: "left",
  padding: "4px 24px 4px 0",
  fontSize: "0.6875rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#666",
};

const labelCell: React.CSSProperties = {
  padding: "4px 24px 4px 0",
  color: "#666",
  fontSize: "0.875rem",
};

const valueCell: React.CSSProperties = {
  padding: "4px 24px 4px 0",
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#000",
};

const extraLabel: React.CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  color: "#666",
  textTransform: "uppercase",
  marginBottom: "4px",
};

const extraValue: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#000",
};
