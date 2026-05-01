import "dotenv/config";
import { GitHubClient } from "@github-intelligence/github-client";
import {
  IssuesCollector,
  FlatCacheIssuesRepository,
  PullRequestsCollector,
  FlatCachePullRequestsRepository,
} from "@github-intelligence/issues-collector";
import {
  MembersCollector,
  FlatCacheMembersRepository,
} from "@github-intelligence/members-collector";
import { Command } from "commander";
import { subMonths } from "date-fns";

import { Printer } from "./printer.js";

const program = new Command();

program
  .command("issues")
  .requiredOption("--repo <owner/repo>", "GitHub repository in owner/repo format")
  .option("--from <date>", "Start date (ISO format, default: 1 month ago)")
  .option("--to <date>", "End date (ISO format, default: today)")
  .action(async (opts: { repo: string; from?: string; to?: string }) => {
    const [owner, repo] = opts.repo.split("/");
    if (owner === undefined || repo === undefined || owner === "" || repo === "") {
      console.error("Error: --repo must be in <owner>/<repo> format");
      process.exit(1);
    }
    const to = opts.to !== undefined ? new Date(opts.to) : new Date();
    const from = opts.from !== undefined ? new Date(opts.from) : subMonths(to, 1);
    const client = new GitHubClient(process.env["GITHUB_TOKEN"], process.env["GITHUB_BASE_URL"]);
    const repository = new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]);
    const collector = new IssuesCollector(client, repository);
    const issues = await collector.collect({ owner, repo, from, to });
    Printer.printIssuesTable(issues);
  });

program
  .command("prs")
  .requiredOption("--repo <owner/repo>", "GitHub repository in owner/repo format")
  .option("--from <date>", "Start date (ISO format, default: 1 month ago)")
  .option("--to <date>", "End date (ISO format, default: today)")
  .action(async (opts: { repo: string; from?: string; to?: string }) => {
    const [owner, repo] = opts.repo.split("/");
    if (owner === undefined || repo === undefined || owner === "" || repo === "") {
      console.error("Error: --repo must be in <owner>/<repo> format");
      process.exit(1);
    }
    const to = opts.to !== undefined ? new Date(opts.to) : new Date();
    const from = opts.from !== undefined ? new Date(opts.from) : subMonths(to, 1);
    const client = new GitHubClient(process.env["GITHUB_TOKEN"], process.env["GITHUB_BASE_URL"]);
    const repository = new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]);
    const collector = new PullRequestsCollector(client, repository);
    const prs = await collector.collect({ owner, repo, from, to });
    Printer.printIssuesTable(prs);
  });

program
  .command("members")
  .requiredOption("--org <org>", "GitHub organization slug")
  .action(async (opts: { org: string }) => {
    const client = new GitHubClient(process.env["GITHUB_TOKEN"], process.env["GITHUB_BASE_URL"]);
    const repository = new FlatCacheMembersRepository(process.env["CACHE_FOLDER"]);
    const collector = new MembersCollector(client, repository);
    const members = await collector.fetch(opts.org);
    Printer.printMembersTable(members);
  });

program.parse(process.argv);
