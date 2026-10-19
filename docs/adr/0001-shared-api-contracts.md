# 1. Define the API/UI contract in `api-contracts`

Date: 2026-10-19

## Status

Accepted

## Context

The API (`apps/api`) and the UI (`apps/ui`) exchange JSON over REST. If each side declares its own request and response shapes, they drift apart, and the mismatch only shows up at runtime in the browser.

## Decision

The contract between the API and the UI lives in one package, `packages/api-contracts`.

- Each request query and response is a [Zod](https://zod.dev/) schema in `src/schemas`.
- The TypeScript types are inferred from the schemas and exported from `src/types`.
- The API uses the schemas at runtime: it validates incoming queries (`issuesQuerySchema`) and serializes responses (`SerializeOptions({ schema })`).
- The UI imports only the types, so no Zod ends up in the browser bundle for that purpose.
- Neither app declares its own copy of a request or response shape.

## Consequences

**Positive**

- Safer changes: changing a schema breaks the compilation of every API and UI usage, so a contract change cannot be missed.
- The API cannot return data that does not match the schema, because the response is validated before it is sent.
- One source of truth: schema and type cannot diverge, since the type is derived from the schema.
- The schemas have their own unit tests, independent of both apps.

**Negative**

- Every contract change requires rebuilding `api-contracts` before the apps see it.
- The UI does not validate responses at runtime. Its safety comes from the API validating them before sending.
- Both apps depend on the package, so breaking changes must be coordinated in the same change.
