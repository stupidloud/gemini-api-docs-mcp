import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";
import { searchDocumentation, upsertDocument } from "../src/db";

describe("Gemini Docs MCP worker", () => {
	describe("request for /healthz", () => {
		it("responds with ok JSON (unit style)", async () => {
			const request = new Request<unknown, IncomingRequestCfProperties>(
				"http://example.com/healthz"
			);
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(await response.json()).toEqual({ ok: true });
		});

		it("responds with ok JSON (integration style)", async () => {
			const request = new Request("http://example.com/healthz");
			const response = await SELF.fetch(request);
			expect(await response.json()).toEqual({ ok: true });
		});
	});

	describe("MCP over createMcpHandler", () => {
		it("initializes, lists tools, and calls a tool", async () => {
			const ctx = createExecutionContext();
			const initResponse = await worker.fetch(
				mcpRequest({
					jsonrpc: "2.0",
					id: 1,
					method: "initialize",
					params: {
						protocolVersion: "2025-11-25",
						capabilities: {},
						clientInfo: {
							name: "vitest",
							version: "0.0.0",
						},
					},
				}),
				env,
				ctx,
			);

			expect(initResponse.status).toBe(200);
			const initBody = await initResponse.json<{
				result: { serverInfo: { name: string }; protocolVersion: string };
			}>();
			expect(initBody.result.serverInfo.name).toBe("Gemini API Docs");

			const listResponse = await worker.fetch(
				mcpRequest({
					jsonrpc: "2.0",
					id: 2,
					method: "tools/list",
					params: {},
				}),
				env,
				ctx,
			);
			expect(listResponse.status).toBe(200);
			const listBody = await listResponse.json<{ result: { tools: Array<{ name: string }> } }>();
			expect(listBody.result.tools.map((tool) => tool.name)).toEqual([
				"search_documentation",
				"get_capability_page",
				"get_current_model",
			]);

			const callResponse = await worker.fetch(
				mcpRequest({
					jsonrpc: "2.0",
					id: 3,
					method: "tools/call",
					params: {
						name: "get_capability_page",
						arguments: {},
					},
				}),
				env,
				ctx,
			);
			expect(callResponse.status).toBe(200);
			const callBody = await callResponse.json<{
				result: { content: Array<{ type: string; text: string }> };
			}>();
			expect(callBody.result.content[0].text).toContain("Available Capabilities:");

			await waitOnExecutionContext(ctx);
		});
	});

	describe("request for unknown routes", () => {
		it("responds with 404", async () => {
			const request = new Request<unknown, IncomingRequestCfProperties>(
				"http://example.com/missing"
			);
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(404);
		});
	});

	describe("documentation search", () => {
		it("orders results by FTS relevance with title hits first", async () => {
			await upsertDocument(env.DOCS_DB, {
				url: "https://example.com/content-only-ranking",
				title: "Background guide",
				content: "rankingtoken rankingtoken rankingtoken appears only in content",
				content_hash: "content-only-ranking",
				last_updated: "2026-01-01T00:00:00.000Z",
			});
			await upsertDocument(env.DOCS_DB, {
				url: "https://example.com/title-ranking",
				title: "rankingtoken guide",
				content: "short content",
				content_hash: "title-ranking",
				last_updated: "2026-01-01T00:00:00.000Z",
			});

			const result = await searchDocumentation(env.DOCS_DB, ["rankingtoken"]);

			expect(result.indexOf("# [rankingtoken guide]")).toBeGreaterThanOrEqual(0);
			expect(result.indexOf("# [rankingtoken guide]")).toBeLessThan(
				result.indexOf("# [Background guide]"),
			);
		});
	});
});

function mcpRequest(body: unknown): Request {
	return new Request("http://example.com/mcp", {
		method: "POST",
		headers: {
			accept: "application/json, text/event-stream",
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
	});
}
