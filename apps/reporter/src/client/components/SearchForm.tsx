import { useState } from "react";
import { subMonths, formatISO } from "date-fns";

interface Props {
  onSearch: (params: {
    owner: string;
    repo: string;
    from: string;
    to: string;
    token?: string;
  }) => void;
  disabled: boolean;
}

export function SearchForm({ onSearch, disabled }: Props) {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [from, setFrom] = useState(() =>
    formatISO(subMonths(new Date(), 1), { representation: "date" })
  );
  const [to, setTo] = useState(() =>
    formatISO(new Date(), { representation: "date" })
  );
  const [token, setToken] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({ owner, repo, from, to, token: token || undefined });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px" }}>
      <label>
        Owner
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="e.g. facebook"
          required
          style={{ display: "block", width: "100%" }}
        />
      </label>
      <label>
        Repository
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="e.g. react"
          required
          style={{ display: "block", width: "100%" }}
        />
      </label>
      <label>
        From
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
          style={{ display: "block", width: "100%" }}
        />
      </label>
      <label>
        To
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          style={{ display: "block", width: "100%" }}
        />
      </label>
      <label>
        GitHub Token
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Optional — increases rate limit"
          style={{ display: "block", width: "100%" }}
        />
      </label>
      <button type="submit" disabled={disabled}>
        {disabled ? "Loading…" : "Search"}
      </button>
    </form>
  );
}
