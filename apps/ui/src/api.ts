import type {
  AgingWipItem,
  CycleTimeResponse,
  IssuesResponse,
  OrgMember,
  QuickCloseResponse,
  ReportResponse,
  ThroughputResponse,
} from "@github-intelligence/api-contracts";

import { IssuesQueryBuilder } from "./issues-query-builder.js";
import type { SearchFilters } from "./types/search-filters.js";

const issuesQueryBuilder = new IssuesQueryBuilder();

export async function fetchIssues(
  filters: SearchFilters,
  signal?: AbortSignal,
): Promise<IssuesResponse> {
  const query = issuesQueryBuilder.build(filters);
  const response = await fetch(query === "" ? "/api/issues" : `/api/issues?${query}`, { signal });

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

export async function fetchQuickClose(): Promise<QuickCloseResponse> {
  const response = await fetch("/api/quick-close");

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<QuickCloseResponse>;
}
