import { useEffect, useState } from "react";
import { fetchIssues } from "./api.js";
import type { IssuesResponse } from "./types.js";
import { StatsSummary } from "./components/StatsSummary.js";
import { IssuesOverTimeChart } from "./components/IssuesOverTimeChart.js";
import { IssueTable } from "./components/IssueTable.js";
import { SearchForm, DEFAULT_FILTERS } from "./components/SearchForm.js";
import type { SearchFilters } from "./components/SearchForm.js";

const PAGE_SIZE = 50;

type Status = "loading" | "error" | "success";

export function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IssuesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    fetchIssues()
      .then((result) => {
        setData(result);
        setStatus("success");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      });
  }, []);

  function handleSearch(newFilters: SearchFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  const authors = data
    ? Array.from(new Set(data.issues.map((i) => i.author))).sort()
    : [];

  const assignees = data
    ? Array.from(new Set(data.issues.flatMap((i) => i.assignees ?? []))).sort()
    : [];

  const filteredIssues = data
    ? data.issues.filter((i) => {
        if (filters.type !== "all" && i.type !== filters.type) return false;
        if (filters.title !== "" && !i.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
        if (filters.state !== "all" && i.state !== filters.state) return false;
        if (filters.author !== "" && i.author !== filters.author) return false;
        if (filters.assignee !== "" && !(i.assignees ?? []).includes(filters.assignee)) return false;
        if (filters.oneDayOnly && !(i.closedAt !== null && i.closedAt.slice(0, 10) === i.createdAt.slice(0, 10))) return false;
        return true;
      })
    : [];

  const pagedIssues = filteredIssues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredIssues.length / PAGE_SIZE);

  return (
    <main style={{ padding: "40px 24px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "1200px", margin: "0 auto", color: "#000" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 32px" }}>GitHub Issues Reporter</h1>

      {status === "loading" && <p style={{ color: "#666" }}>Loading…</p>}
      {status === "error" && <p style={{ color: "#f00" }}>{error}</p>}

      {status === "success" && data !== null && (
        <>
          <SearchForm
            authors={authors}
            assignees={assignees}
            onSearch={handleSearch}
          />

          <StatsSummary
            stats={data.stats}
            extraExpanded={statsExpanded}
            onToggleExtra={() => setStatsExpanded((e) => !e)}
          />

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
