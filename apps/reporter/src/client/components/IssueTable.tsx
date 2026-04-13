import type { GitHubIssueDTO } from "../types.js";

interface Props {
  issues: GitHubIssueDTO[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function IssueTable({ issues, page, totalPages, onPageChange }: Props) {
  if (issues.length === 0) {
    return <p>No issues found.</p>;
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>State</th>
            <th style={thStyle}>Author</th>
            <th style={thStyle}>Created</th>
            <th style={thStyle}>Closed</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td style={tdStyle}>{issue.number}</td>
              <td style={tdStyle}>
                <a href={issue.url} target="_blank" rel="noreferrer">
                  {issue.title}
                </a>
              </td>
              <td style={tdStyle}>{issue.state}</td>
              <td style={tdStyle}>{issue.author}</td>
              <td style={tdStyle}>{issue.createdAt.slice(0, 10)}</td>
              <td style={tdStyle}>{issue.closedAt?.slice(0, 10) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "16px 0" }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};
