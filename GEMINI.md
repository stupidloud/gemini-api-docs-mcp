# Gemini API Docs Extension

Use the `gemini-api-docs` MCP server when the user asks about Gemini API documentation, models, SDKs, tool use, migration guidance, API capabilities, or current examples.

Prefer the extension tools over memory for Gemini API facts that may have changed.

Tool guidance:

- Use `search_documentation` for keyword searches across the indexed Gemini API documentation. Keep queries short and focused.
- Use `get_capability_page` when the user asks for a specific documentation page or capability by title.
- Use `get_current_model` when the user asks which Gemini model or model documentation is current.

When answering from these tools, cite the documentation page URLs returned by the tool output.
