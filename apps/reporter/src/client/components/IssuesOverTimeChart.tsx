import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  byDay: Array<{ date: string; issues: number; prs: number }>;
}

export function IssuesOverTimeChart({ byDay }: Props) {
  if (byDay.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-panel p-5 mb-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
        Issues &amp; PRs Over Time
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={byDay}>
          <CartesianGrid stroke="oklch(0.28 0 0)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="date"
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
          <Line
            type="monotone"
            dataKey="issues"
            stroke="oklch(0.70 0.17 162)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="prs"
            stroke="oklch(0.70 0.18 295)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
