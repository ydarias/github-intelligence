import type { IssuesResponse } from "./types.js";

export async function fetchIssues(): Promise<IssuesResponse> {
  const response = await fetch("/api/issues");

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<IssuesResponse>;
}
