import type { IssueOriginEntry } from "@github-intelligence/api-contracts";
import { useState } from "react";


import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.js";

type SortColumn = keyof Pick<IssueOriginEntry, "login" | "total" | "open" | "closed" | "percentage">;
type SortDir = "asc" | "desc";

interface SortState {
  column: SortColumn;
  dir: SortDir;
}

interface Props {
  entries: IssueOriginEntry[];
}

export function IssueOriginsTable({ entries }: Props) {
  const [sort, setSort] = useState<SortState>({ column: "total", dir: "desc" });

  function handleHeaderClick(column: SortColumn) {
    setSort((prev) =>
      prev.column === column
        ? { column, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { column, dir: "desc" },
    );
  }

  const sorted = [...entries].sort((a, b) => {
    const av = a[sort.column];
    const bv = b[sort.column];
    const cmp =
      typeof av === "string" && typeof bv === "string"
        ? av.localeCompare(bv)
        : (av as number) - (bv as number);
    return sort.dir === "asc" ? cmp : -cmp;
  });

  function indicator(column: SortColumn): string {
    if (sort.column !== column) return "";
    return sort.dir === "asc" ? " ▲" : " ▼";
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          Issue Origins
          <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-accent">
            {entries.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleHeaderClick("login")}
              >
                Author{indicator("login")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleHeaderClick("total")}
              >
                Total{indicator("total")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleHeaderClick("open")}
              >
                Open{indicator("open")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleHeaderClick("closed")}
              >
                Closed{indicator("closed")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleHeaderClick("percentage")}
              >
                % of total{indicator("percentage")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted">
                  No issues found.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((entry) => (
                <TableRow key={entry.login}>
                  <TableCell className="font-medium">{entry.name ?? entry.login}</TableCell>
                  <TableCell>{entry.total}</TableCell>
                  <TableCell className="text-muted">{entry.open}</TableCell>
                  <TableCell className="text-muted">{entry.closed}</TableCell>
                  <TableCell className="text-muted">{entry.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
