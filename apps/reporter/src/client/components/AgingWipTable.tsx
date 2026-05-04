import type { AgingWipItem } from "../types.js";

interface Props {
  items: AgingWipItem[];
}

function ageColor(ageDays: number): string {
  if (ageDays > 30) return "text-red-400";
  if (ageDays >= 7) return "text-yellow-400";
  return "text-emerald-400";
}

export function AgingWipTable({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-panel p-5 mb-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
        Aging Work In Progress
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-muted border-b border-border">
              <th className="pb-2 pr-4 font-medium">Title</th>
              <th className="pb-2 pr-4 font-medium">Repo</th>
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 font-medium text-right">Age (days)</th>
              <th className="pb-2 pr-4 font-medium">Author</th>
              <th className="pb-2 font-medium">Assignees</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                <td className="py-2 pr-4 max-w-xs">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors truncate block"
                    title={item.title}
                  >
                    {item.title}
                  </a>
                </td>
                <td className="py-2 pr-4 text-muted text-xs">{item.repository}</td>
                <td className="py-2 pr-4">
                  <span className="text-xs uppercase tracking-wide text-muted">{item.type}</span>
                </td>
                <td className={`py-2 pr-4 text-right font-mono font-semibold ${ageColor(item.ageDays)}`}>
                  {item.ageDays}
                </td>
                <td className="py-2 pr-4 text-muted text-xs">{item.author}</td>
                <td className="py-2 text-muted text-xs">
                  {item.assignees.length > 0 ? item.assignees.join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
