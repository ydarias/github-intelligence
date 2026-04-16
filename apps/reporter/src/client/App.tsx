import { useEffect, useState } from "react";
import { fetchIssues } from "./api.js";
import type { IssuesResponse, IssueStats, GitHubIssueDTO } from "./types.js";
import { StatsSummary } from "./components/StatsSummary.js";
import { IssuesOverTimeChart } from "./components/IssuesOverTimeChart.js";
import { IssueTable } from "./components/IssueTable.js";
import { SearchForm, DEFAULT_FILTERS } from "./components/SearchForm.js";
import type { SearchFilters } from "./components/SearchForm.js";

function computeFilteredStats(items: GitHubIssueDTO[], byDayFromServer: IssueStats["byDay"]): IssueStats {
  const issues = items.filter((i) => i.type === "issue");
  const prs = items.filter((i) => i.type === "pr");

  const closedItems = items.filter((i) => i.state === "closed" && i.closedAt !== null);
  const timeToCloseHours = closedItems.map((i) => {
    const ms = new Date(i.closedAt!).getTime() - new Date(i.createdAt).getTime();
    return ms / (1000 * 60 * 60);
  });

  let avgTimeToCloseHours: number | null = null;
  let medianTimeToCloseHours: number | null = null;
  if (timeToCloseHours.length > 0) {
    avgTimeToCloseHours = timeToCloseHours.reduce((sum, h) => sum + h, 0) / timeToCloseHours.length;
    const sorted = [...timeToCloseHours].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianTimeToCloseHours = sorted.length % 2 === 0
      ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
      : (sorted[mid] ?? 0);
  }

  const issuesByDay = new Map<string, number>();
  const prsByDay = new Map<string, number>();
  for (const item of items) {
    const day = item.createdAt.slice(0, 10);
    if (item.type === "pr") {
      prsByDay.set(day, (prsByDay.get(day) ?? 0) + 1);
    } else {
      issuesByDay.set(day, (issuesByDay.get(day) ?? 0) + 1);
    }
  }
  const allDays = new Set([...issuesByDay.keys(), ...prsByDay.keys()]);
  const byDay = allDays.size > 0
    ? Array.from(allDays)
        .map((date) => ({ date, issues: issuesByDay.get(date) ?? 0, prs: prsByDay.get(date) ?? 0 }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : byDayFromServer;

  return {
    total: issues.length,
    open: issues.filter((i) => i.state === "open").length,
    closed: issues.filter((i) => i.state === "closed").length,
    totalPRs: prs.length,
    openPRs: prs.filter((i) => i.state === "open").length,
    closedPRs: prs.filter((i) => i.state === "closed").length,
    avgTimeToCloseHours,
    medianTimeToCloseHours,
    byDay,
  };
}

const PAGE_SIZE = 50;

type Status = "loading" | "error" | "success";

export function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IssuesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

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

  const filteredStats = data ? computeFilteredStats(filteredIssues, data.stats.byDay) : null;

  const pagedIssues = filteredIssues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredIssues.length / PAGE_SIZE);

  return (
    <main style={{ padding: "40px 24px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "1200px", margin: "0 auto", color: "#000" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 32px" }}>GitHub Issues Reporter</h1>

      {status === "loading" && <p style={{ color: "#666" }}>Loading…</p>}
      {status === "error" && <p style={{ color: "#f00" }}>{error}</p>}

      {status === "success" && data !== null && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            <SearchForm
              authors={authors}
              assignees={assignees}
              onSearch={handleSearch}
            />
            <StatsSummary stats={filteredStats!} />
          </div>

          <IssuesOverTimeChart byDay={filteredStats!.byDay} />

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
