import { useState } from "react";
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

type Granularity = "day" | "week" | "month";

type Aggregation = "sum" | "last";

interface Props {
  byDay: Array<{ date: string; issues: number; prs: number }>;
  aggregation?: Aggregation;
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

function aggregate(
  byDay: Array<{ date: string; issues: number; prs: number }>,
  granularity: Granularity,
  aggregation: Aggregation,
): Array<{ date: string; issues: number; prs: number }> {
  if (granularity === "day") return byDay;

  const buckets = new Map<string, { issues: number; prs: number }>();
  for (const item of byDay) {
    const key = granularity === "week" ? getWeekStart(item.date) : item.date.slice(0, 7);
    if (aggregation === "last") {
      buckets.set(key, { issues: item.issues, prs: item.prs });
    } else {
      const existing = buckets.get(key) ?? { issues: 0, prs: 0 };
      existing.issues += item.issues;
      existing.prs += item.prs;
      buckets.set(key, existing);
    }
  }

  return Array.from(buckets.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const GRANULARITIES: { label: string; value: Granularity }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

export function IssuesOverTimeChart({ byDay, aggregation = "sum" }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("day");

  if (byDay.length === 0) return null;

  const data = aggregate(byDay, granularity, aggregation);

  return (
    <div className="rounded-xl border border-border bg-panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Issues &amp; PRs Over Time
        </p>
        <div className="flex gap-1">
          {GRANULARITIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setGranularity(value)}
              className={`px-2 py-0.5 text-xs rounded ${
                granularity === value
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
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
