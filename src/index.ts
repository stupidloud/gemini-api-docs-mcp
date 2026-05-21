import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getCapabilityPage, getCurrentModel, searchDocumentation } from "./db";
import { refreshDocs } from "./ingest";

function createServer(env: Env): McpServer {
	const server = new McpServer({
		name: "Gemini API Docs",
		version: "0.1.0",
	});

	server.registerTool(
		"search_documentation",
		{
			description:
				"Performs a keyword search on Gemini API documentation. Use at most 3 short queries and prefer 1-3 keywords per query.",
			inputSchema: {
				queries: z.array(z.string().min(1)).max(3),
			},
		},
		async ({ queries }) => ({
			content: [{ type: "text", text: await searchDocumentation(env.DOCS_DB, queries) }],
		}),
	);

	server.registerTool(
		"get_capability_page",
		{
			description:
				"Retrieves a specific documentation page by exact title. Omit capability to list available titles.",
			inputSchema: {
				capability: z.string().optional(),
			},
		},
		async ({ capability }) => ({
			content: [{ type: "text", text: await getCapabilityPage(env.DOCS_DB, capability) }],
		}),
	);

	server.registerTool(
		"get_current_model",
		{
			description: "Returns the canonical Gemini Models documentation page when available.",
			inputSchema: {},
		},
		async () => ({
			content: [{ type: "text", text: await getCurrentModel(env.DOCS_DB) }],
		}),
	);

	return server;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/healthz") {
			return Response.json({ ok: true });
		}

		if (url.pathname === "/internal/refresh") {
			if (!isAuthorized(request, env)) {
				return new Response("Unauthorized", { status: 401 });
			}

			return Response.json(await refreshDocs(env));
		}

		const server = createServer(env);
		return createMcpHandler(server, {
			route: "/mcp",
			enableJsonResponse: true,
			sessionIdGenerator: undefined,
		})(request, env, ctx);
	},

	async scheduled(_controller, env, ctx): Promise<void> {
		ctx.waitUntil(refreshDocs(env));
	},
} satisfies ExportedHandler<Env>;

function isAuthorized(request: Request, env: Env): boolean {
	const token = "ADMIN_TOKEN" in env ? env.ADMIN_TOKEN : undefined;
	return typeof token === "string" && request.headers.get("authorization") === `Bearer ${token}`;
}
