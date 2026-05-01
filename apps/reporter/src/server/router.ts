import "dotenv/config";
import {
  FlatCacheIssuesRepository,
  FlatCachePullRequestsRepository,
} from "@github-intelligence/issues-collector";
import { FlatCacheMembersRepository } from "@github-intelligence/members-collector";
import { Router } from "express";

import { computeStats } from "./stats.js";

export const router = Router();

// TODO the router be responsible just for the URL mapping, the action is handled at controller level
router.get("/issues", (_req, res) => {
  const issuesRepo = new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]);
  const prsRepo = new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]);
  const items = [...issuesRepo.loadAll(), ...prsRepo.loadAll()];

  if (items.length === 0) {
    res.status(404).json({ error: "No cached issues found. Run the CLI first." });
    return;
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const stats = computeStats(items);
  res.json({ issues: items, stats, total: items.length });
});

router.get("/members", (_req, res) => {
  const repo = new FlatCacheMembersRepository(process.env["CACHE_FOLDER"]);
  res.json(repo.loadAll());
});
