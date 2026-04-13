import { Command } from "commander";
import { subMonths } from "date-fns";
import {
  GitHubClient,
  IssuesCollector,
  FlatCacheIssuesRepository,
} from "@github-intelligence/issues-collector";
import { Printer } from "./printer.js";

const program = new Command();

program
  .requiredOption("--repo <owner/repo>", "GitHub repository in owner/repo format")
  .option("--token <token>", "GitHub personal access token")
  .option("--from <date>", "Start date (ISO format, default: 1 month ago)")
  .option("--to <date>", "End date (ISO format, default: today)")
  .parse(process.argv);

const opts = program.opts<{
  repo: string;
  token?: string;
  from?: string;
  to?: string;
}>();

const [owner, repo] = opts.repo.split("/");
if (owner === undefined || repo === undefined || owner === "" || repo === "") {
  console.error("Error: --repo must be in <owner>/<repo> format");
  process.exit(1);
}

const to = opts.to !== undefined ? new Date(opts.to) : new Date();
const from = opts.from !== undefined ? new Date(opts.from) : subMonths(to, 1);

const client = new GitHubClient(opts.token);
const repository = new FlatCacheIssuesRepository();
const collector = new IssuesCollector(client, repository);

const issues = await collector.collect({ owner, repo, from, to });

Printer.printIssuesTable(issues);
