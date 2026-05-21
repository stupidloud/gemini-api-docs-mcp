# Gemini API Docs MCP

Hosted MCP service for querying current Google Gemini API documentation, with a Gemini CLI extension manifest for easy installation.

The public MCP endpoint is:

```text
https://gemini-docs.dev/mcp
```

This repository maintains the shared hosted documentation MCP service and its Gemini CLI extension packaging. It is not intended to guide users through running separate local deployments.

## Install

```bash
gemini extensions install <github-repo-url>
```

Restart Gemini CLI after installation, then verify:

```text
/extensions list
/mcp
```

## Tools

- `search_documentation(queries)` searches indexed Gemini API documentation.
- `get_capability_page(capability)` retrieves a specific documentation page by title, or lists available titles when omitted.
- `get_current_model()` retrieves the current Gemini Models documentation page when available.

## Gemini CLI Extension

The Gemini CLI extension entrypoint is [gemini-extension.json](gemini-extension.json). It loads the hosted Streamable HTTP MCP server and [GEMINI.md](GEMINI.md) provides model-facing guidance for when to use the tools.

## Gallery Publishing

Gemini CLI's extension gallery automatically indexes public GitHub repositories. To make this extension discoverable:

1. Add the `gemini-cli-extension` topic to the GitHub repository.
2. Keep `gemini-extension.json` at the repository root.
3. Tag a release, for example `v0.1.0`.

The gallery crawler checks tagged repositories daily and lists extensions that pass validation.
