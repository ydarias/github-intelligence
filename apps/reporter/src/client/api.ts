import type {
  AgingWipItem,
  CycleTimeResponse,
  IssuesResponse,
  OrgMember,
  ReportResponse,
  ThroughputResponse,
} from "./types.js";

export async function fetchIssues(): Promise<IssuesResponse> {
  const response = await fetch("/api/issues");

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<IssuesResponse>;
}

export async function fetchMembers(): Promise<OrgMember[]> {
  const response = await fetch("/api/members");

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<OrgMember[]>;
}

export async function fetchReport(): Promise<ReportResponse> {
  const response = await fetch("/api/report");

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<ReportResponse>;
}

export async function fetchAgingWip(): Promise<AgingWipItem[]> {
  const response = await fetch("/api/aging-wip");

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<AgingWipItem[]>;
}

export async function fetchThroughput(): Promise<ThroughputResponse> {
  const response = await fetch("/api/throughput");

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<ThroughputResponse>;
}

export async function fetchCycleTime(): Promise<CycleTimeResponse> {
  const response = await fetch("/api/cycle-time");

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<CycleTimeResponse>;
}
