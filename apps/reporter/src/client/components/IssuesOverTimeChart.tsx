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
    <div style={{ margin: "16px 0" }}>
      <h2>Issues Over Time</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={byDay}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
