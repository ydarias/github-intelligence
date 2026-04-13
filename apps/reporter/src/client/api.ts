import type { IssuesResponse } from "./types.js";

export async function fetchIssues(params: {
  owner: string;
  repo: string;
  from: string;
  to: string;
  token?: string;
}): Promise<IssuesResponse> {
  const response = await fetch("/api/issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<IssuesResponse>;
}
