import { Command } from "commander";
import {
  GitHubClient,
  IssuesCollector,
  FlatCacheIssuesRepository,
  type GitHubIssue,
} from "@github-intelligence/issues-collector";

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
const from = (() => {
  if (opts.from !== undefined) return new Date(opts.from);
  const d = new Date(to);
  d.setMonth(d.getMonth() - 1);
  return d;
})();

const client = new GitHubClient(opts.token);
const repository = new FlatCacheIssuesRepository();
const collector = new IssuesCollector(client, repository);

const issues = await collector.collect({ owner, repo, from, to });

function printTable(issues: GitHubIssue[]): void {
  if (issues.length === 0) {
    console.log("No issues found.");
    return;
  }

  const COL_NUM = 6;
  const COL_STATE = 8;
  const titleWidth = Math.max(
    10,
    Math.min(60, Math.max(...issues.map((i) => i.title.length)))
  );
  const authorWidth = Math.max(
    6,
    Math.max(...issues.map((i) => i.author.length))
  );

  const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);

  const header =
    pad("#", COL_NUM) +
    "  " +
    pad("Title", titleWidth) +
    "  " +
    pad("State", COL_STATE) +
    "  " +
    pad("Author", authorWidth);

  const divider = "-".repeat(header.length);

  console.log(header);
  console.log(divider);

  for (const issue of issues) {
    console.log(
      pad(String(issue.number), COL_NUM) +
        "  " +
        pad(issue.title, titleWidth) +
        "  " +
        pad(issue.state, COL_STATE) +
        "  " +
        pad(issue.author, authorWidth)
    );
  }
}

printTable(issues);
