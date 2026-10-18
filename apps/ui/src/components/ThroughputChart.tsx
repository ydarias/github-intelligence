import type { WeeklyThroughput } from "@github-intelligence/api-contracts";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type BarRectangleItem,
} from "recharts";


interface Props {
  byWeek: WeeklyThroughput[];
}

export function ThroughputChart({ byWeek }: Props) {
  const [selected, setSelected] = useState<WeeklyThroughput | null>(null);

  if (byWeek.length === 0) return null;

  function handleBarClick(bar: BarRectangleItem) {
    const data = bar.payload as WeeklyThroughput;
    setSelected((prev) => (prev?.week === data.week ? null : data));
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5 mb-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
        Weekly Throughput
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={byWeek}>
          <CartesianGrid stroke="oklch(0.28 0 0)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid oklch(0.28 0 0)",
              borderRadius: "8px",
              fontSize: "0.8125rem",
              background: "oklch(0.18 0 0)",
              color: "oklch(0.97 0 0)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem", color: "oklch(0.55 0 0)" }} />
          <Bar dataKey="issues" stackId="a" fill="oklch(0.70 0.17 162)" radius={[0, 0, 0, 0]} cursor="pointer" onClick={handleBarClick} />
          <Bar dataKey="prs" stackId="a" fill="oklch(0.70 0.18 295)" radius={[4, 4, 0, 0]} cursor="pointer" onClick={handleBarClick} />
        </BarChart>
      </ResponsiveContainer>

      {selected && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              Week of {selected.week} &mdash; {selected.items.length} items
            </p>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted border-b border-border">
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Repo</th>
                  <th className="pb-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                  >
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
                    <td className="py-2 text-xs uppercase tracking-wide text-muted">{item.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
