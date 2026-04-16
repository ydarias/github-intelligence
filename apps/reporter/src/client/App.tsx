import { useEffect, useState } from "react";
import { fetchIssues } from "./api.js";
import type { IssuesResponse } from "./types.js";
import { StatsSummary } from "./components/StatsSummary.js";
import { IssuesOverTimeChart } from "./components/IssuesOverTimeChart.js";
import { IssueTable } from "./components/IssueTable.js";

const PAGE_SIZE = 50;

type Status = "loading" | "error" | "success";
type Tab = "all" | "sameDay" | "open" | "byAuthor";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "all", label: "All Issues" },
  { id: "sameDay", label: "Same Day" },
  { id: "open", label: "Still Open" },
  { id: "byAuthor", label: "By Author" },
];

export function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IssuesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

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

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setPage(1);
    setSelectedAuthor("");
    setSelectedAssignee("");
  }

  const authors = data
    ? Array.from(new Set(data.issues.map((i) => i.author))).sort()
    : [];

  const assignees = data
    ? Array.from(new Set(data.issues.flatMap((i) => i.assignees ?? []))).sort()
    : [];

  const filteredIssues = data
    ? data.issues.filter((i) => {
        if (activeTab === "sameDay" && !(i.closedAt !== null && i.closedAt.slice(0, 10) === i.createdAt.slice(0, 10))) return false;
        if (activeTab === "open" && i.state !== "open") return false;
        if (selectedAuthor !== "" && i.author !== selectedAuthor) return false;
        if (selectedAssignee !== "" && !(i.assignees ?? []).includes(selectedAssignee)) return false;
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
          <StatsSummary items={
            activeTab === "all"
              ? selectedAuthor
                ? [{ label: selectedAuthor, value: filteredIssues.length }]
                : [
                    { label: "Total", value: data.stats.total },
                    { label: "Open", value: data.stats.open },
                    { label: "Closed", value: data.stats.closed },
                  ]
              : activeTab === "byAuthor"
                ? [{ label: selectedAuthor || "All Authors", value: filteredIssues.length }]
                : [{ label: activeTab === "sameDay" ? "Same Day" : "Still Open", value: filteredIssues.length }]
          } />

          <div style={{ borderTop: "1px solid #eaeaea", margin: "32px 0 0" }} />

          <nav style={{ display: "flex", gap: "0", margin: "0 0 0" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid #000" : "2px solid transparent",
                  padding: "12px 20px",
                  fontSize: "0.875rem",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? "#000" : "#666",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ borderTop: "1px solid #eaeaea" }} />

          {activeTab === "all" && (
            <IssuesOverTimeChart byDay={data.stats.byDay} />
          )}

          <IssueTable
            issues={pagedIssues}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            authors={authors}
            selectedAuthor={selectedAuthor}
            onAuthorChange={(author) => { setSelectedAuthor(author); setPage(1); }}
            assignees={assignees}
            selectedAssignee={selectedAssignee}
            onAssigneeChange={(assignee) => { setSelectedAssignee(assignee); setPage(1); }}
          />
        </>
      )}
    </main>
  );
}
