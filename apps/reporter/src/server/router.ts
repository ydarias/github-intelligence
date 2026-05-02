import "dotenv/config";
import {
  FlatCacheIssuesRepository,
  FlatCachePullRequestsRepository,
} from "@github-intelligence/issues-collector";
import { FlatCacheMembersRepository } from "@github-intelligence/members-collector";
import { Router } from "express";

import { computeAgingWip } from "./aging-wip-stats.js";
import { computeCycleTime } from "./cycle-time-stats.js";
import { computeReport } from "./report-stats.js";
import { computeStats } from "./stats.js";
import { computeThroughput } from "./throughput-stats.js";

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

router.get("/report", (_req, res) => {
  const issuesRepo = new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]);
  const prsRepo = new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]);
  const items = [...issuesRepo.loadAll(), ...prsRepo.loadAll()];

  if (items.length === 0) {
    res.status(404).json({ error: "No cached issues found. Run the CLI first." });
    return;
  }

  res.json(computeReport(items));
});

router.get("/aging-wip", (_req, res) => {
  const issuesRepo = new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]);
  const prsRepo = new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]);
  const items = [...issuesRepo.loadAll(), ...prsRepo.loadAll()];

  if (items.length === 0) {
    res.status(404).json({ error: "No cached issues found. Run the CLI first." });
    return;
  }

  res.json(computeAgingWip(items));
});

router.get("/throughput", (_req, res) => {
  const issuesRepo = new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]);
  const prsRepo = new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]);
  const items = [...issuesRepo.loadAll(), ...prsRepo.loadAll()];

  if (items.length === 0) {
    res.status(404).json({ error: "No cached issues found. Run the CLI first." });
    return;
  }

  res.json(computeThroughput(items));
});

router.get("/cycle-time", (_req, res) => {
  const issuesRepo = new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]);
  const prsRepo = new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]);
  const items = [...issuesRepo.loadAll(), ...prsRepo.loadAll()];

  if (items.length === 0) {
    res.status(404).json({ error: "No cached issues found. Run the CLI first." });
    return;
  }

  res.json(computeCycleTime(items));
});
