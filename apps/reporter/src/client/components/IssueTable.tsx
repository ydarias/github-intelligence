import type { GitHubIssueDTO } from "../types.js";

import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table.js";

interface Props {
  issues: GitHubIssueDTO[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function IssueTable({ issues, page, totalPages, onPageChange }: Props) {
  if (issues.length === 0) {
    return <p className="text-muted text-sm py-8">No issues found.</p>;
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-panel overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Closed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell>
                <Badge variant={issue.type === "pr" ? "pr" : "issue"}>{issue.type}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-muted text-xs font-mono">
                  {issue.repository}#{issue.number}
                </span>
              </TableCell>
              <TableCell>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text text-sm hover:text-accent transition-colors"
                >
                  {issue.title}
                </a>
              </TableCell>
              <TableCell>
                <Badge variant={issue.state === "open" ? "open" : "closed"}>{issue.state}</Badge>
              </TableCell>
              <TableCell className="text-muted text-sm">{issue.author}</TableCell>
              <TableCell className="text-muted text-sm">
                {issue.assignees?.length ? issue.assignees.join(", ") : "—"}
              </TableCell>
              <TableCell className="text-muted text-sm tabular-nums">
                {issue.createdAt.slice(0, 10)}
              </TableCell>
              <TableCell className="text-muted text-sm tabular-nums">
                {issue.closedAt?.slice(0, 10) ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-muted text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
