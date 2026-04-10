# Issues collector

Create a new package that is able to get all the issues from a Github repository given a start date and end date.

To get the issues it should use the Github API, if there is an official client the better, if not creating a new one is fine.

All the issues will be stored using a repository patter, and the implementation should use flat-cache to store the JSONs at the local filesystem.

The main components of the package should be something similar to this:

```
github-client <- issues-collector -> issues-repository
```
