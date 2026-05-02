import type { RepositoryReport } from "../types.js";
import { IssuesOverTimeChart } from "./IssuesOverTimeChart.js";

interface Props {
  repositories: RepositoryReport[];
}

export function ReportView({ repositories }: Props) {
  if (repositories.length === 0) {
    return <p className="text-muted text-sm">No repository data found.</p>;
  }

  return (
    <div className="space-y-10">
      {repositories.map((repo) => (
        <section key={repo.repository}>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-text mb-4">
            {repo.repository}
          </h2>
          <IssuesOverTimeChart byDay={repo.byDay} />
        </section>
      ))}
    </div>
  );
}
