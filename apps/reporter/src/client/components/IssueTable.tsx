import type { GitHubIssueDTO } from "../types.js";

interface Props {
  issues: GitHubIssueDTO[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  authors?: string[];
  selectedAuthor?: string;
  onAuthorChange?: (author: string) => void;
  assignees?: string[];
  selectedAssignee?: string;
  onAssigneeChange?: (assignee: string) => void;
}

export function IssueTable({ issues, page, totalPages, onPageChange, authors, selectedAuthor, onAuthorChange, assignees, selectedAssignee, onAssigneeChange }: Props) {
  if (issues.length === 0) {
    return <p style={{ color: "#666", padding: "24px 0", fontSize: "0.875rem" }}>No issues found.</p>;
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Issue</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>State</th>
            <th style={thStyle}>
              {authors && onAuthorChange ? (
                <select
                  value={selectedAuthor ?? ""}
                  onChange={(e) => onAuthorChange(e.target.value)}
                  style={{
                    font: "inherit",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: selectedAuthor ? "#000" : "#666",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <option value="">Author</option>
                  {authors.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              ) : "Author"}
            </th>
            <th style={thStyle}>
              {assignees && onAssigneeChange ? (
                <select
                  value={selectedAssignee ?? ""}
                  onChange={(e) => onAssigneeChange(e.target.value)}
                  style={{
                    font: "inherit",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: selectedAssignee ? "#000" : "#666",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <option value="">Assignees</option>
                  {assignees.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              ) : "Assignees"}
            </th>
            <th style={thStyle}>Created</th>
            <th style={thStyle}>Closed</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id} style={{ borderBottom: "1px solid #eaeaea" }}>
              <td style={tdStyle}>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  background: issue.type === "pr" ? "#eff6ff" : "#f0fdf4",
                  color: issue.type === "pr" ? "#1d4ed8" : "#15803d",
                  border: `1px solid ${issue.type === "pr" ? "#bfdbfe" : "#bbf7d0"}`,
                }}>
                  {issue.type}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: "#666", fontSize: "0.8125rem" }}>{issue.repository}#{issue.number}</span>
              </td>
              <td style={tdStyle}>
                <a href={issue.url} target="_blank" rel="noreferrer" style={{ color: "#000", textDecoration: "none", fontSize: "0.875rem" }}>
                  {issue.title}
                </a>
              </td>
              <td style={tdStyle}>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  background: issue.state === "open" ? "#f0fdf4" : "#faf5ff",
                  color: issue.state === "open" ? "#15803d" : "#7e22ce",
                  border: `1px solid ${issue.state === "open" ? "#bbf7d0" : "#e9d5ff"}`,
                }}>
                  {issue.state}
                </span>
              </td>
              <td style={{ ...tdStyle, color: "#666" }}>{issue.author}</td>
              <td style={{ ...tdStyle, color: "#666" }}>{issue.assignees?.length ? issue.assignees.join(", ") : "—"}</td>
              <td style={{ ...tdStyle, color: "#666" }}>{issue.createdAt.slice(0, 10)}</td>
              <td style={{ ...tdStyle, color: "#666" }}>{issue.closedAt?.slice(0, 10) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0", fontSize: "0.875rem" }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={pagerBtnStyle(page <= 1)}
          >
            Previous
          </button>
          <span style={{ color: "#666" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={pagerBtnStyle(page >= totalPages)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function pagerBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    border: "1px solid #eaeaea",
    borderRadius: "6px",
    background: "#fff",
    color: disabled ? "#ccc" : "#000",
    cursor: disabled ? "default" : "pointer",
    fontSize: "0.875rem",
  };
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #eaeaea",
  fontSize: "0.6875rem",
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#666",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
};
