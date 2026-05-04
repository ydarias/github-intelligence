import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { CycleTimeItem } from "../types.js";

interface Props {
  items: CycleTimeItem[];
}

interface DotPayload {
  closeDate: string;
  cycleDays: number;
  title: string;
  url: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DotPayload; color: string }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const { closeDate, cycleDays, title, url } = payload[0]!.payload;

  return (
    <div
      style={{
        border: "1px solid oklch(0.28 0 0)",
        borderRadius: "8px",
        fontSize: "0.8125rem",
        background: "oklch(0.18 0 0)",
        color: "oklch(0.97 0 0)",
        padding: "8px 12px",
        maxWidth: "280px",
      }}
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{
          color: "oklch(0.70 0.17 250)",
          display: "block",
          marginBottom: "4px",
          wordBreak: "break-word",
        }}
      >
        {title}
      </a>
      <div style={{ color: "oklch(0.55 0 0)" }}>
        {closeDate} · {cycleDays}d
      </div>
    </div>
  );
}

export function CycleTimeScatterPlot({ items }: Props) {
  if (items.length === 0) return null;

  const issueData = items
    .filter((i) => i.type === "issue")
    .map((i) => ({ closeDate: i.closeDate, cycleDays: i.cycleDays, title: i.title, url: i.url }));

  const prData = items
    .filter((i) => i.type === "pr")
    .map((i) => ({ closeDate: i.closeDate, cycleDays: i.cycleDays, title: i.title, url: i.url }));

  return (
    <div className="rounded-xl border border-border bg-panel p-5 mb-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">Cycle Time</p>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart>
          <CartesianGrid stroke="oklch(0.28 0 0)" strokeDasharray="0" />
          <XAxis
            dataKey="closeDate"
            type="category"
            name="Close date"
            tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            dataKey="cycleDays"
            type="number"
            name="Cycle days"
            unit="d"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "0.75rem", color: "oklch(0.55 0 0)" }} />
          {issueData.length > 0 && (
            <Scatter
              name="Issues"
              data={issueData}
              fill="oklch(0.70 0.17 162)"
              opacity={0.7}
              cursor="pointer"
              onClick={(dot: DotPayload) => window.open(dot.url, "_blank", "noreferrer")}
            />
          )}
          {prData.length > 0 && (
            <Scatter
              name="PRs"
              data={prData}
              fill="oklch(0.70 0.18 295)"
              opacity={0.7}
              cursor="pointer"
              onClick={(dot: DotPayload) => window.open(dot.url, "_blank", "noreferrer")}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
