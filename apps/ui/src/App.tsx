import type {
  AgingWipItem,
  CycleTimeResponse,
  IssuesResponse,
  OrgMember,
  QuickCloseResponse,
  ReportResponse,
  ThroughputResponse,
} from "@github-intelligence/api-contracts";
import { X, List, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchAgingWip,
  fetchCycleTime,
  fetchIssues,
  fetchMembers,
  fetchQuickClose,
  fetchReport,
  fetchThroughput,
} from "./api.js";
import { AgingWipTable } from "./components/AgingWipTable.js";
import { CycleTimeScatterPlot } from "./components/CycleTimeScatterPlot.js";
import { IssueOriginsTable } from "./components/IssueOriginsTable.js";
import { IssuesOverTimeChart } from "./components/IssuesOverTimeChart.js";
import { IssueTable } from "./components/IssueTable.js";
import { MembersTable } from "./components/MembersTable.js";
import { ReportView } from "./components/ReportView.js";
import { SearchForm } from "./components/SearchForm.js";
import { StatsSummary } from "./components/StatsSummary.js";
import { ThroughputChart } from "./components/ThroughputChart.js";
import { DEFAULT_FILTERS } from "./default-filters.js";
import type { SearchFilters } from "./types/search-filters.js";

const PAGE_SIZE = 50;

type Status = "loading" | "error" | "success";
type View = "issues" | "members" | "report" | "metrics";

export function App() {
  const [view, setView] = useState<View>("issues");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IssuesResponse | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [quickClose, setQuickClose] = useState<QuickCloseResponse | null>(null);
  const [reportStatus, setReportStatus] = useState<Status>("loading");
  const [reportError, setReportError] = useState<string | null>(null);
  const [agingWip, setAgingWip] = useState<AgingWipItem[]>([]);
  const [throughput, setThroughput] = useState<ThroughputResponse | null>(null);
  const [cycleTime, setCycleTime] = useState<CycleTimeResponse | null>(null);
  const [metricsStatus, setMetricsStatus] = useState<Status>("loading");
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showIssues, setShowIssues] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as "dark" | "light") ?? "dark",
  );

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }

  useEffect(() => {
    fetchMembers()
      .then(setMembers)
      .catch(() => {});
    Promise.all([fetchReport(), fetchQuickClose()])
      .then(([reportResult, quickCloseResult]) => {
        setReport(reportResult);
        setQuickClose(quickCloseResult);
        setReportStatus("success");
      })
      .catch((e: unknown) => {
        setReportError(e instanceof Error ? e.message : "Unknown error");
        setReportStatus("error");
      });
    Promise.all([fetchAgingWip(), fetchThroughput(), fetchCycleTime()])
      .then(([wip, tp, ct]) => {
        setAgingWip(wip);
        setThroughput(tp);
        setCycleTime(ct);
        setMetricsStatus("success");
      })
      .catch((e: unknown) => {
        setMetricsError(e instanceof Error ? e.message : "Unknown error");
        setMetricsStatus("error");
      });
  }, []);

  // Refetch on every filters change. Aborting the previous request means a stale
  // response can never overwrite a newer one. The current data stays on screen meanwhile.
  useEffect(() => {
    const controller = new AbortController();
    setRefreshing(true);
    fetchIssues(filters, controller.signal)
      .then((result) => {
        setData(result);
        setError(null);
        setStatus("success");
        setRefreshing(false);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
        setRefreshing(false);
      });
    return () => controller.abort();
  }, [filters]);

  function handleSearch(newFilters: SearchFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  const pagedIssues = data ? data.issues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];
  const totalPages = data ? Math.ceil(data.issues.length / PAGE_SIZE) : 0;

  return (
    <div data-theme={theme} className="min-h-screen bg-surface text-text">
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-sm font-semibold tracking-widest uppercase text-muted">
            GitHub Intelligence
          </h1>
          <nav className="flex gap-6">
            <button
              onClick={() => setView("issues")}
              className={`text-sm font-medium transition-colors ${view === "issues" ? "text-text" : "text-muted hover:text-text"}`}
            >
              Issues
            </button>
            <button
              onClick={() => setView("members")}
              className={`text-sm font-medium transition-colors ${view === "members" ? "text-text" : "text-muted hover:text-text"}`}
            >
              Members
            </button>
            <button
              onClick={() => setView("report")}
              className={`text-sm font-medium transition-colors ${view === "report" ? "text-text" : "text-muted hover:text-text"}`}
            >
              Report
            </button>
            <button
              onClick={() => setView("metrics")}
              className={`text-sm font-medium transition-colors ${view === "metrics" ? "text-text" : "text-muted hover:text-text"}`}
            >
              Metrics
            </button>
          </nav>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted transition-colors hover:bg-panel hover:text-text"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-8">
        {view === "members" && <MembersTable members={members} />}

        {view === "metrics" && (
          <>
            {metricsStatus === "loading" && (
              <p className="text-muted text-sm animate-pulse">Loading…</p>
            )}
            {metricsStatus === "error" && <p className="text-red-400 text-sm">{metricsError}</p>}
            {metricsStatus === "success" && (
              <>
                <AgingWipTable items={agingWip} />
                <ThroughputChart byWeek={throughput?.byWeek ?? []} />
                <CycleTimeScatterPlot items={cycleTime?.items ?? []} />
              </>
            )}
          </>
        )}

        {view === "report" && (
          <>
            {reportStatus === "loading" && (
              <p className="text-muted text-sm animate-pulse">Loading…</p>
            )}
            {reportStatus === "error" && <p className="text-red-400 text-sm">{reportError}</p>}
            {reportStatus === "success" && report !== null && (
              <ReportView repositories={report.repositories} quickClose={quickClose} />
            )}
          </>
        )}

        {view === "issues" && (
          <>
            {status === "loading" && <p className="text-muted text-sm animate-pulse">Loading…</p>}
            {status === "error" && <p className="text-red-400 text-sm">{error}</p>}
          </>
        )}

        {view === "issues" && status === "success" && data !== null && (
          <>
            <div
              className={`grid grid-cols-2 gap-6 mb-8 transition-opacity ${refreshing ? "opacity-60" : ""}`}
              aria-busy={refreshing}
            >
              <SearchForm
                authors={data.filterOptions.authors}
                assignees={data.filterOptions.assignees}
                labels={data.filterOptions.labels}
                repositories={data.filterOptions.repositories}
                onSearch={handleSearch}
              />
              <StatsSummary stats={data.stats} timeToCloseByMonth={data.stats.timeToCloseByMonth} />
            </div>

            <IssuesOverTimeChart byDay={data.stats.byDay} />

            <IssueOriginsTable entries={data.stats.byAuthor} />

            {/* Floating toggle button */}
            <button
              onClick={() => setShowIssues(true)}
              className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full border border-border bg-panel px-5 py-3 text-sm font-medium text-text shadow-xl transition-colors hover:bg-surface hover:border-accent hover:text-accent"
            >
              <List className="h-4 w-4" />
              Issues
              <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                {data.total}
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
                    {data.total}
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
