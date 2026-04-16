# PRs collector

Add the functionality to issues-collector to get all the PRs from a Github repository given a start date and end date.

To get the PRs it should use the github-client, creating a new method, and refactoring the code to prevent duplicated code.

All the PRs will be stored using a repository pattern, and the implementation should use flat-cache to store the JSONs at the local filesystem. As it is right now for the issues.

The cli-runner should get the PRs using the existing command.

The reporter should list the PRs with the issues, crating a new column that differentiates between issues and PRs. The graph should be updated accordingly, using different series for issues and PRs.
