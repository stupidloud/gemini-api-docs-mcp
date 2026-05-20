# Gemini Docs MCP Server

Cloudflare Workers implementation for a remote MCP server that serves Google Gemini API documentation over `/mcp`.

This branch is initialized with `wrangler init`, then extended with Cloudflare Agents `createMcpHandler`, D1, and scheduled refresh support.

## Status

- Remote MCP endpoint: `/mcp`
- MCP handler: `createMcpHandler` from `agents/mcp`
- Health endpoint: `/healthz`
- Manual refresh endpoint: `/internal/refresh`
- Scheduled refresh: hourly cron
- Storage: D1 with a `docs` table and `docs_fts` FTS5 virtual table

## Tools

- `search_documentation(queries)`
- `get_capability_page(capability)`
- `get_current_model()`

## Setup

Install dependencies:

```bash
npm install
```

Create D1:

```bash
npm run db:create
```

Put the returned `database_id` into `wrangler.jsonc`, then run:

```bash
npm run cf-typegen
npm run db:migrate
npm run check
npm test -- --run
```

Use a secret for manual refresh:

```bash
wrangler secret put ADMIN_TOKEN
```

## Development

```bash
npm run dev
```

The local MCP endpoint is:

```text
http://127.0.0.1:8787/mcp
```

## Notes

- The previous Python/FastMCP/Cloud Run implementation is not present in this working tree.
- This branch does not implement stdio mode.
- The D1 `database_id` is still a placeholder until the real database is created.
