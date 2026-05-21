const WARNING_BANNER = `[!WARNING]
SDKs: The @google/generative-ai (JavaScript) and google-generativeai (Python) SDKs are legacy. Please migrate to the new @google/genai (JavaScript) and google-genai (Python) SDKs.
Models: Gemini-1.5 to gemini-2.0 are old legacy models. Use the newer models available.`;

const FTS5_SPECIAL_CHARS = [".", "@", "-"];

export type DocRecord = {
	url: string;
	title: string;
	content: string;
	content_hash: string;
	last_updated: string;
};

export async function ensureSchema(db: D1Database): Promise<void> {
	await db
		.prepare(
			`CREATE TABLE IF NOT EXISTS docs (
				url TEXT PRIMARY KEY,
				title TEXT NOT NULL,
				content TEXT NOT NULL,
				content_hash TEXT NOT NULL,
				last_updated TEXT NOT NULL
			)`,
		)
		.run();
	await db
		.prepare(
			`CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
				title,
				content,
				tokenize = "unicode61"
			)`,
		)
		.run();
	await db.prepare("CREATE INDEX IF NOT EXISTS idx_docs_title ON docs(title)").run();
	await db.prepare("CREATE INDEX IF NOT EXISTS idx_docs_last_updated ON docs(last_updated)").run();
}

export function sanitizeTerm(query: string): string {
	return query
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((term) => {
			if (!FTS5_SPECIAL_CHARS.some((char) => term.includes(char))) {
				return term;
			}

			return `"${term.replaceAll('"', '""')}"`;
		})
		.join(" ");
}

export async function upsertDocument(db: D1Database, doc: DocRecord): Promise<void> {
	await db
		.prepare(
			`INSERT INTO docs (url, title, content, content_hash, last_updated)
			 VALUES (?1, ?2, ?3, ?4, ?5)
			 ON CONFLICT(url) DO UPDATE SET
			   title = excluded.title,
			   content = excluded.content,
			   content_hash = excluded.content_hash,
			   last_updated = excluded.last_updated`,
		)
		.bind(doc.url, doc.title, doc.content, doc.content_hash, doc.last_updated)
		.run();

	const row = await db
		.prepare("SELECT rowid FROM docs WHERE url = ?1")
		.bind(doc.url)
		.first<{ rowid: number }>();

	if (!row?.rowid) {
		throw new Error(`Failed to resolve rowid for ${doc.url}`);
	}

	await db.prepare("DELETE FROM docs_fts WHERE rowid = ?1").bind(row.rowid).run();
	await db
		.prepare("INSERT INTO docs_fts(rowid, title, content) VALUES (?1, ?2, ?3)")
		.bind(row.rowid, doc.title, doc.content)
		.run();
}

export async function searchDocumentation(db: D1Database, queries: string[]): Promise<string> {
	const normalized = queries.map((query) => sanitizeTerm(query)).filter(Boolean).slice(0, 3);
	if (normalized.length === 0) {
		return "No matching documentation found.";
	}

	await ensureSchema(db);
	const results = await db
		.prepare(
			`SELECT docs.title, docs.url, docs.content
			 FROM docs_fts
			 JOIN docs ON docs_fts.rowid = docs.rowid
			 WHERE docs_fts MATCH ?1
			 ORDER BY bm25(docs_fts, 5.0, 1.0), docs.title ASC
			 LIMIT 3`,
		)
		.bind(normalized.map((query) => `(${query})`).join(" OR "))
		.all<{ title: string; url: string; content: string }>();

	if (!results.results.length) {
		return "No matching documentation found.";
	}

	const formatted = results.results.map((result) => {
		return `# [${result.title}](${result.url})\n${result.content}\n`;
	});

	return `${WARNING_BANNER}\n\n${formatted.join("\n---\n\n")}`;
}

export async function getCapabilityPage(db: D1Database, capability?: string): Promise<string> {
	await ensureSchema(db);

	if (!capability) {
		const titles = await db
			.prepare("SELECT title FROM docs ORDER BY title LIMIT 200")
			.all<{ title: string }>();

		if (!titles.results.length) {
			return "Available Capabilities:\n- No pages indexed yet. Run the refresh job first.";
		}

		return `Available Capabilities:\n${titles.results.map((row) => `- ${row.title}`).join("\n")}`;
	}

	const page = await db
		.prepare("SELECT content FROM docs WHERE title = ?1 LIMIT 1")
		.bind(capability)
		.first<{ content: string }>();

	return page?.content ?? `Capability '${capability}' not found.`;
}

export async function getCurrentModel(db: D1Database): Promise<string> {
	await ensureSchema(db);

	const page = await db
		.prepare(
			`SELECT content
			 FROM docs
			 WHERE title LIKE '%Gemini Models%'
			    OR url LIKE '%/models%'
			 LIMIT 1`,
		)
		.first<{ content: string }>();

	return page?.content ?? "Gemini Models documentation page not found.";
}
