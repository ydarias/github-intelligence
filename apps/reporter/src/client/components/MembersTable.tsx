import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "./ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.js";
import type { OrgMember } from "../types.js";

const JOINED_FROM = "2025-04-01";
const JOINED_TO = "2026-03-31";

function joinedDate(createdAt: string): string {
  const date = createdAt.slice(0, 10);
  return date >= JOINED_FROM && date <= JOINED_TO ? date : "";
}

function toCSV(members: OrgMember[]): string {
  const header = "Full Name,Email,Job Role,Talent ID,Joined Date,Leave Date";
  const rows = members.map((m) =>
    [m.name ?? "", m.email ?? "", m.jobRole ?? "", m.talentId ?? "", joinedDate(m.createdAt), ""]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
}

interface Props {
  members: OrgMember[];
}

export function MembersTable({ members }: Props) {
  const [copied, setCopied] = useState(false);

  const sorted = [...members].sort((a, b) => {
    if (!a.name && b.name) return 1;
    if (a.name && !b.name) return -1;
    return (a.name ?? "").toLowerCase().localeCompare((b.name ?? "").toLowerCase());
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(toCSV(sorted));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied
    }
  }

  function handleDownload() {
    const blob = new Blob([toCSV(sorted)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          Members
          <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-accent">
            {members.length}
          </span>
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { void handleCopy(); }}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy CSV"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Role</TableHead>
              <TableHead>Talent ID</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Leave Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name ?? "—"}</TableCell>
                <TableCell className="text-muted">{member.email ?? "—"}</TableCell>
                <TableCell className="text-muted">{member.jobRole ?? "—"}</TableCell>
                <TableCell className="text-muted">{member.talentId ?? "—"}</TableCell>
                <TableCell className="text-muted">{joinedDate(member.createdAt)}</TableCell>
                <TableCell className="text-muted"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
