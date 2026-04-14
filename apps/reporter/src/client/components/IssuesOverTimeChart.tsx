import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  byDay: Array<{ date: string; count: number }>;
}

export function IssuesOverTimeChart({ byDay }: Props) {
  if (byDay.length === 0) return null;

  return (
    <div style={{ margin: "24px 0" }}>
      <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.08em", color: "#666", textTransform: "uppercase", margin: "0 0 12px" }}>Issues Over Time</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={byDay}>
          <CartesianGrid stroke="#eaeaea" strokeDasharray="0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ border: "1px solid #eaeaea", borderRadius: "6px", fontSize: "0.8125rem" }} />
          <Line type="monotone" dataKey="count" stroke="#000" dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
