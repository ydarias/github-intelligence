import "dotenv/config";
import { Command } from "commander";
import { subMonths } from "date-fns";
import {
  GitHubClient,
  IssuesCollector,
  FlatCacheIssuesRepository,
  PullRequestsCollector,
  FlatCachePullRequestsRepository,
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

const client = new GitHubClient(process.env["GITHUB_TOKEN"], process.env["GITHUB_BASE_URL"]);
const issuesRepository = new FlatCacheIssuesRepository(process.env["CACHE_FOLDER"]);
const issuesCollector = new IssuesCollector(client, issuesRepository);
const prsRepository = new FlatCachePullRequestsRepository(process.env["CACHE_FOLDER"]);
const prsCollector = new PullRequestsCollector(client, prsRepository);

const [issues, prs] = await Promise.all([
  issuesCollector.collect({ owner, repo, from, to }),
  prsCollector.collect({ owner, repo, from, to }),
]);

Printer.printIssuesTable([...issues, ...prs]);
