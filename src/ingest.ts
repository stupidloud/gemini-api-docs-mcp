import { ensureSchema, upsertDocument, type DocRecord } from "./db";

type RefreshSummary = {
	scanned: number;
	updated: number;
	failed: number;
};

const DEFAULT_LLMS_TXT_URL = "https://ai.google.dev/gemini-api/docs/llms.txt";

export async function refreshDocs(env: Env): Promise<RefreshSummary> {
	await ensureSchema(env.DOCS_DB);

	const indexUrl = env.LLMS_TXT_URL || DEFAULT_LLMS_TXT_URL;
	const links = parseLlmsTxt(await fetchPlainText(indexUrl));
	const concurrency = parsePositiveInt(env.REFRESH_CONCURRENCY, 6);

	let updated = 0;
	let failed = 0;

	await runPool(links, concurrency, async ([title, sourceUrl]) => {
		try {
			const normalizedUrl = sourceUrl.replace(/\.md\.txt$/, "");
			const content = await fetchPlainText(sourceUrl);
			const contentHash = await sha256(content);
			const existing = await env.DOCS_DB
				.prepare("SELECT content_hash FROM docs WHERE url = ?1 LIMIT 1")
				.bind(normalizedUrl)
				.first<{ content_hash: string }>();

			if (existing?.content_hash === contentHash) {
				return;
			}

			const doc: DocRecord = {
				url: normalizedUrl,
				title,
				content,
				content_hash: contentHash,
				last_updated: new Date().toISOString(),
			};

			await upsertDocument(env.DOCS_DB, doc);
			updated += 1;
		} catch (error) {
			failed += 1;
			console.error("refresh failed", { title, sourceUrl, error });
		}
	});

	return { scanned: links.length, updated, failed };
}

async function fetchPlainText(url: string): Promise<string> {
	const response = await fetch(url, {
		headers: {
			"user-agent": "gemini-api-docs-mcp-workers/0.1.0",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
	}

	return response.text();
}

function parseLlmsTxt(content: string): Array<[string, string]> {
	return content
		.split("\n")
		.map((line) => line.trim())
		.flatMap((line) => {
			const linked = /^- \[([^\]]+)\]\((https?:\/\/[^)]+)\)(?::\s*(.*))?$/.exec(line);
			if (linked) {
				return [[decodeHtml(linked[1].trim()), linked[2].trim()] as [string, string]];
			}

			const bare = /^- \((https?:\/\/[^)]+)\)(?::\s*(.*))?$/.exec(line);
			if (bare) {
				return [[titleFromUrl(bare[1], bare[2]), bare[1].trim()] as [string, string]];
			}

			return [];
		});
}

function titleFromUrl(url: string, description?: string): string {
	const normalizedDescription = description?.trim();
	if (normalizedDescription) {
		return decodeHtml(normalizedDescription);
	}

	const pathname = new URL(url).pathname;
	return decodeURIComponent(pathname.split("/").at(-1)?.replace(/\.md\.txt$/, "") || url);
}

function decodeHtml(text: string): string {
	return text
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">");
}

async function sha256(content: string): Promise<string> {
	const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
	return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parsePositiveInt(rawValue: string | undefined, fallback: number): number {
	const value = Number.parseInt(rawValue ?? "", 10);
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function runPool<T>(
	items: T[],
	concurrency: number,
	worker: (item: T) => Promise<void>,
): Promise<void> {
	let nextIndex = 0;

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length || 1) }, async () => {
			while (nextIndex < items.length) {
				const current = items[nextIndex];
				nextIndex += 1;
				await worker(current);
			}
		}),
	);
}
