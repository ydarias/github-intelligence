import { useState } from "react";


export interface SearchFilters {
  type: "all" | "issue" | "pr";
  title: string;
  state: "all" | "open" | "closed";
  author: string;
  assignee: string;
  oneDayOnly: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  type: "all",
  title: "",
  state: "all",
  author: "",
  assignee: "",
  oneDayOnly: false,
};

interface Props {
  authors: string[];
  assignees: string[];
  onSearch: (filters: SearchFilters) => void;
}

export function SearchForm({ authors, assignees, onSearch }: Props) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    onSearch(DEFAULT_FILTERS);
  }

  function handleSearch() {
    onSearch(filters);
  }

  return (
    <div style={{ border: "1px solid #eaeaea", borderRadius: "8px" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #eaeaea" }}>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666" }}>Filter</span>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px 16px", alignItems: "center" }}>
          <label style={labelStyle}>Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as SearchFilters["type"] }))}
            style={selectStyle}
          >
            <option value="all">All</option>
            <option value="issue">Issues</option>
            <option value="pr">PRs</option>
          </select>

          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={filters.title}
            onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value }))}
            style={inputStyle}
          />

          <label style={labelStyle}>State</label>
          <select
            value={filters.state}
            onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value as SearchFilters["state"] }))}
            style={selectStyle}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <label style={labelStyle}>Author</label>
          <select
            value={filters.author}
            onChange={(e) => setFilters((f) => ({ ...f, author: e.target.value }))}
            style={selectStyle}
          >
            <option value="">All</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <label style={labelStyle}>Assignee</label>
          <select
            value={filters.assignee}
            onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
            style={selectStyle}
          >
            <option value="">All</option>
            {assignees.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <label style={labelStyle}>One Day Issue?</label>
          <input
            type="checkbox"
            checked={filters.oneDayOnly}
            onChange={(e) => setFilters((f) => ({ ...f, oneDayOnly: e.target.checked }))}
            style={{ justifySelf: "start" }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
          <button onClick={handleReset} style={resetBtnStyle}>Reset</button>
          <button onClick={handleSearch} style={searchBtnStyle}>Search</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#666",
};

const selectStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: "1px solid #eaeaea",
  borderRadius: "6px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#000",
};

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: "1px solid #eaeaea",
  borderRadius: "6px",
  fontSize: "0.875rem",
  color: "#000",
};

const resetBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  border: "1px solid #eaeaea",
  borderRadius: "6px",
  background: "#fff",
  color: "#000",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const searchBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  border: "1px solid #000",
  borderRadius: "6px",
  background: "#000",
  color: "#fff",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
};
