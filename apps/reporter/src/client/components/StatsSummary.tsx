import type { IssueStats } from "../types.js";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card.js";

interface Props {
  stats: IssueStats;
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function StatsSummary({ stats }: Props) {
  const { timeToClosePercentiles: p } = stats;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <MetricGroup
            label="Issues"
            total={stats.total}
            open={stats.open}
            closed={stats.closed}
            avg={stats.avgIssuesPerDay}
            accentClass="text-emerald"
          />
          <MetricGroup
            label="Pull Requests"
            total={stats.totalPRs}
            open={stats.openPRs}
            closed={stats.closedPRs}
            avg={stats.avgPRsPerDay}
            accentClass="text-accent"
          />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
            Time to close
          </p>
          <div className="grid grid-cols-4 gap-3">
            {(["p50", "p75", "p90", "p99"] as const).map((key) => (
              <div key={key} className="rounded-lg border border-border bg-surface p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted mb-1">
                  {key.toUpperCase()}
                </p>
                <p className="text-xl font-bold text-text">{p ? formatHours(p[key]) : "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricGroupProps {
  label: string;
  total: number;
  open: number;
  closed: number;
  avg: number;
  accentClass: string;
}

function MetricGroup({ label, total, open, closed, avg, accentClass }: MetricGroupProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
      <p className={`text-xs font-semibold uppercase tracking-widest ${accentClass}`}>{label}</p>
      <div className="grid grid-cols-2 gap-y-2">
        <Metric label="Total" value={total} large />
        <Metric label="Avg/day" value={avg.toFixed(1)} />
        <Metric label="Open" value={open} />
        <Metric label="Closed" value={closed} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  large,
}: {
  label: string;
  value: number | string;
  large?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <p className={large ? "text-3xl font-bold text-text" : "text-lg font-semibold text-text"}>
        {value}
      </p>
    </div>
  );
}
