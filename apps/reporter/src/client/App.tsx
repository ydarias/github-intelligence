import { useState } from "react";
import { fetchIssues } from "./api.js";
import type { IssuesResponse } from "./types.js";
import { SearchForm } from "./components/SearchForm.js";
import { StatsSummary } from "./components/StatsSummary.js";
import { IssuesOverTimeChart } from "./components/IssuesOverTimeChart.js";
import { IssueTable } from "./components/IssueTable.js";

const PAGE_SIZE = 50;

type Status = "idle" | "loading" | "error" | "success";

export function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IssuesResponse | null>(null);
  const [page, setPage] = useState(1);

  async function handleSearch(params: {
    owner: string;
    repo: string;
    from: string;
    to: string;
    token?: string;
  }) {
    setStatus("loading");
    setError(null);
    setPage(1);
    try {
      const result = await fetchIssues(params);
      setData(result);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  const pagedIssues = data
    ? data.issues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];
  const totalPages = data ? Math.ceil(data.issues.length / PAGE_SIZE) : 0;

  return (
    <main style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>GitHub Issues Reporter</h1>
      <SearchForm onSearch={handleSearch} disabled={status === "loading"} />
      {status === "loading" && <p>Loading…</p>}
      {status === "error" && <p style={{ color: "red" }}>{error}</p>}
      {status === "success" && data !== null && (
        <>
          <StatsSummary stats={data.stats} />
          <IssuesOverTimeChart byDay={data.stats.byDay} />
          <IssueTable
            issues={pagedIssues}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </main>
  );
}
