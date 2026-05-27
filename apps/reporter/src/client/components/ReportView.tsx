import type { QuickCloseResponse, RepositoryReport } from "../types.js";

import { IssuesOverTimeChart } from "./IssuesOverTimeChart.js";
import { QuickCloseChart } from "./QuickCloseChart.js";

interface Props {
  repositories: RepositoryReport[];
  quickClose: QuickCloseResponse | null;
}

export function ReportView({ repositories, quickClose }: Props) {
  if (repositories.length === 0) {
    return <p className="text-muted text-sm">No repository data found.</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <QuickCloseChart byDay={quickClose?.byDay ?? []} />
      </section>
      {repositories.map((repo) => (
        <section key={repo.repository}>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-text mb-4">
            {repo.repository}
          </h2>
          <IssuesOverTimeChart byDay={repo.byDay} aggregation="last" />
        </section>
      ))}
    </div>
  );
}
