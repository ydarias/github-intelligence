import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.js";
import type { OrgMember } from "../types.js";

interface Props {
  members: OrgMember[];
}

export function MembersTable({ members }: Props) {
  const sorted = [...members].sort((a, b) => {
    if (!a.name && b.name) return 1;
    if (a.name && !b.name) return -1;
    return (a.name ?? "").toLowerCase().localeCompare((b.name ?? "").toLowerCase());
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          Members
          <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-accent">
            {members.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Member since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name ?? "—"}</TableCell>
                <TableCell className="text-muted">{member.login}</TableCell>
                <TableCell className="text-muted">{member.email ?? "—"}</TableCell>
                <TableCell className="text-muted">{member.createdAt.slice(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
