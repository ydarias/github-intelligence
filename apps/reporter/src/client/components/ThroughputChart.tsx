import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { WeeklyThroughput } from "../types.js";

interface Props {
  byWeek: WeeklyThroughput[];
}

export function ThroughputChart({ byWeek }: Props) {
  if (byWeek.length === 0) return null;

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
          <Bar dataKey="issues" stackId="a" fill="oklch(0.70 0.17 162)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="prs" stackId="a" fill="oklch(0.70 0.18 295)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
