import { useEffect, useState } from "react";
import { X, List, Sun, Moon } from "lucide-react";
import { fetchIssues } from "./api.js";
import type { IssuesResponse, IssueStats, GitHubIssueDTO, TimeToClosePercentiles } from "./types.js";
import { StatsSummary } from "./components/StatsSummary.js";
import { IssuesOverTimeChart } from "./components/IssuesOverTimeChart.js";
import { IssueTable } from "./components/IssueTable.js";
import { SearchForm, DEFAULT_FILTERS } from "./components/SearchForm.js";
import type { SearchFilters } from "./components/SearchForm.js";

function nearestRankPercentile(sorted: number[], p: number): number {
  const rank = Math.ceil(p / 100 * sorted.length);
  return sorted[rank - 1] ?? 0;
}

function calendarDaysInRange(dates: string[]): number {
  if (dates.length === 0) return 1;
  const min = dates.reduce((a, b) => (a < b ? a : b));
  const max = dates.reduce((a, b) => (a > b ? a : b));
  return Math.round((new Date(max).getTime() - new Date(min).getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function computeFilteredStats(items: GitHubIssueDTO[], byDayFromServer: IssueStats["byDay"]): IssueStats {
  const issues = items.filter((i) => i.type === "issue");
  const prs = items.filter((i) => i.type === "pr");

  const allDates = items.map((i) => i.createdAt.slice(0, 10));
  const totalDays = calendarDaysInRange(allDates);
  const avgIssuesPerDay = issues.length / totalDays;
  const avgPRsPerDay = prs.length / totalDays;

  const closedItems = items.filter((i) => i.state === "closed" && i.closedAt !== null);
  const timeToCloseHours = closedItems
    .map((i) => (new Date(i.closedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60))
    .sort((a, b) => a - b);

  const timeToClosePercentiles: TimeToClosePercentiles | null = timeToCloseHours.length > 0
    ? {
        p50: nearestRankPercentile(timeToCloseHours, 50),
        p75: nearestRankPercentile(timeToCloseHours, 75),
        p90: nearestRankPercentile(timeToCloseHours, 90),
        p99: nearestRankPercentile(timeToCloseHours, 99),
      }
    : null;

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
    avgIssuesPerDay,
    avgPRsPerDay,
    timeToClosePercentiles,
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
  const [showIssues, setShowIssues] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as "dark" | "light") ?? "dark"
  );

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }

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
    <div data-theme={theme} className="min-h-screen bg-surface text-text">
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <h1 className="text-sm font-semibold tracking-widest uppercase text-muted">
          GitHub Issues Reporter
        </h1>
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted transition-colors hover:bg-panel hover:text-text"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-8">
        {status === "loading" && (
          <p className="text-muted text-sm animate-pulse">Loading…</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {status === "success" && data !== null && (
          <>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <SearchForm
                authors={authors}
                assignees={assignees}
                onSearch={handleSearch}
              />
              <StatsSummary stats={filteredStats!} />
            </div>

            <IssuesOverTimeChart byDay={filteredStats!.byDay} />

            {/* Floating toggle button */}
            <button
              onClick={() => setShowIssues(true)}
              className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full border border-border bg-panel px-5 py-3 text-sm font-medium text-text shadow-xl transition-colors hover:bg-surface hover:border-accent hover:text-accent"
            >
              <List className="h-4 w-4" />
              Issues
              <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                {filteredIssues.length}
              </span>
            </button>

            {/* Backdrop */}
            {showIssues && (
              <div
                className="fixed inset-0 z-40 bg-surface/60 backdrop-blur-sm"
                onClick={() => setShowIssues(false)}
              />
            )}

            {/* Drawer */}
            <div
              className={`fixed top-0 right-0 z-50 h-full w-[70%] max-w-5xl overflow-y-auto border-l border-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out ${
                showIssues ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Issues &amp; Pull Requests
                  <span className="ml-3 rounded-full bg-accent/20 px-2 py-0.5 text-accent">
                    {filteredIssues.length}
                  </span>
                </span>
                <button
                  onClick={() => setShowIssues(false)}
                  className="rounded-md p-1 text-muted transition-colors hover:bg-panel hover:text-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-4">
                <IssueTable
                  issues={pagedIssues}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
