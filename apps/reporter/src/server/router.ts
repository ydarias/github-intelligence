import "dotenv/config";
import { Router } from "express";
import { FlatCacheIssuesRepository } from "@github-intelligence/issues-collector";
import { computeStats } from "./stats.js";

export const router = Router();

router.get("/issues", (_req, res) => {
  const repository = new FlatCacheIssuesRepository(process.env['CACHE_FOLDER']);
  const issues = repository.loadAll();

  if (issues.length === 0) {
    res.status(404).json({ error: "No cached issues found. Run the CLI first." });
    return;
  }

  issues.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const stats = computeStats(issues);
  res.json({ issues, stats, total: issues.length });
});
