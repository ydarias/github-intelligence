import { Router } from "express";
import {
  GitHubClient,
  IssuesCollector,
  FlatCacheIssuesRepository,
} from "@github-intelligence/issues-collector";
import { computeStats } from "./stats.js";

export const router = Router();

router.post("/issues", async (req, res) => {
  const { owner, repo, from, to, token } = req.body as {
    owner: string;
    repo: string;
    from: string;
    to: string;
    token?: string;
  };

  if (!owner || !repo || !from || !to) {
    res.status(400).json({ error: "owner, repo, from, to are required" });
    return;
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    res.status(400).json({ error: "from and to must be valid ISO date strings" });
    return;
  }

  try {
    const client = new GitHubClient(token);
    const repository = new FlatCacheIssuesRepository();
    const collector = new IssuesCollector(client, repository);

    const issues = await collector.collect({ owner, repo, from: fromDate, to: toDate });
    const stats = computeStats(issues);

    res.json({ issues, stats, total: issues.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch issues";
    res.status(500).json({ error: message });
  }
});
