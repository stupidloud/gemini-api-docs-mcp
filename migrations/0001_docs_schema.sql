CREATE TABLE IF NOT EXISTS docs (
	url TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	content TEXT NOT NULL,
	content_hash TEXT NOT NULL,
	last_updated TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
	title,
	content,
	tokenize = "unicode61"
);

CREATE INDEX IF NOT EXISTS idx_docs_title ON docs(title);
CREATE INDEX IF NOT EXISTS idx_docs_last_updated ON docs(last_updated);
