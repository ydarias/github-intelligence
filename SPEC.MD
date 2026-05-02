# Spec: Remove `key` from Repository Interfaces

## Objective

Refactor `IssuesRepository` and `PullRequestsRepository` in `packages/issues-collector` so the `key` parameter is no longer part of the public interface. The key is a flat-cache implementation detail and should be derived internally by the concrete implementations using `GithubIssue.id`.

## New Interfaces

```typescript
export interface IssuesRepository {
  saveAll(issues: GithubIssue[]): void;
  loadAll(): GithubIssue[];
}
```

```typescript
export interface PullRequestsRepository {
  saveAll(prs: GithubIssue[]): void;
  load(id: number): GithubIssue[] | undefined;
  loadAll(): GithubIssue[];
}
```

## Files to Change

| File                                           | Change                                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/repositories/issues-repository.ts`        | Replace `save(key, issues)` + `load(key)` with `saveAll(issues)` + `loadAll()` in interface and implementation |
| `src/repositories/pull-requests-repository.ts` | Replace `save(key, prs)` with `saveAll(prs)`; rename `load(key)` to `load(id)`; update implementation          |
| `src/collectors/issues-collector.ts`           | Update call sites to use `saveAll` / `loadAll`                                                                 |
| `src/collectors/pull-requests-collector.ts`    | Update call sites to use `saveAll` / `load(id)` / `loadAll`                                                    |

## Implementation Rules

- `saveAll` stores each item individually using `String(item.id)` as the flat-cache key.
- `FlatCacheIssuesRepository.loadAll()` returns `[]` when the cache is empty.
- `FlatCachePullRequestsRepository.loadAll()` returns `[]` when the cache is empty (unchanged).
- Deduplication by `GithubIssue.id` and `type` stamping remain as-is.
- The collectors always retrieve the data from the Github Client, and update at the repository, even if the information already existed.

## Testing

- Tests in `src/index.spec.ts` should cover: `saveAll` + `loadAll` round-trip, deduplication, empty-cache behavior, and `load(id)` hit/miss for PRs.
- Use Jest (already configured via `jest.config.cjs`).

## Boundaries

- **Always:** Keep exact dependency versions (no `^`/`~`).
- **Never:** Introduce breaking changes to the exported public API beyond the interface rename.
