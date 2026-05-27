import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { QuickCloseItem } from "../types.js";

type Granularity = "day" | "week" | "month";

interface Props {
  byDay: Array<{ date: string; count: number }>;
  items: QuickCloseItem[];
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

function aggregate(
  byDay: Array<{ date: string; count: number }>,
  granularity: Granularity,
): Array<{ date: string; count: number }> {
  if (granularity === "day") return byDay;

  const buckets = new Map<string, number>();
  for (const item of byDay) {
    const key = granularity === "week" ? getWeekStart(item.date) : item.date.slice(0, 7);
    buckets.set(key, (buckets.get(key) ?? 0) + item.count);
  }

  return Array.from(buckets.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const GRANULARITIES: { label: string; value: Granularity }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

export function QuickCloseChart({ byDay, items }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [showList, setShowList] = useState(false);

  if (byDay.length === 0) return null;

  const data = aggregate(byDay, granularity);

  return (
    <div className="rounded-xl border border-border bg-panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Issues Opened &amp; Closed in &lt; 2 Hours
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
          <Line
            type="monotone"
            dataKey="count"
            stroke="oklch(0.70 0.17 162)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 border-t border-border pt-3">
        <button
          onClick={() => setShowList((v) => !v)}
          className="text-xs text-muted hover:text-text transition-colors"
        >
          {showList ? "Hide issues" : `Show ${items.length} issue${items.length === 1 ? "" : "s"}`}
        </button>

        {showList && (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap">
                  Issue
                </th>
                <th className="pb-2 text-xs font-medium uppercase tracking-widest text-muted">
                  Title
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="py-2 pr-4 text-xs font-mono text-muted whitespace-nowrap">
                    {item.repository}#{item.number}
                  </td>
                  <td className="py-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text hover:text-accent transition-colors"
                    >
                      {item.title}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
