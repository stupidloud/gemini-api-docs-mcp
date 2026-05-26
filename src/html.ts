export function getLandingHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini API Docs MCP | Technical Specification & Setup Guide</title>
    <meta name="description" content="Technical documentation and setup instructions for the hosted Gemini API Docs Model Context Protocol (MCP) server. Learn how to configure it with Gemini CLI, Claude Code, and Codex.">
    <meta name="keywords" content="Gemini API, MCP, Model Context Protocol, Claude Code, Codex, Gemini CLI, AI Coding Agents, Technical Specification">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://gemini-docs.dev/">
    <meta property="og:title" content="Gemini API Docs MCP | Technical Specification & Setup Guide">
    <meta property="og:description" content="Hosted MCP service for accessing official Google Gemini API documentation. Compatible with Gemini CLI, Claude Code, and Codex.">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary">
    <meta property="twitter:url" content="https://gemini-docs.dev/">
    <meta property="twitter:title" content="Gemini API Docs MCP | Technical Specification & Setup Guide">
    <meta property="twitter:description" content="Hosted MCP service for accessing official Google Gemini API documentation. Compatible with Gemini CLI, Claude Code, and Codex.">

    <!-- JSON-LD Structured Data for SEO -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "Gemini API Docs MCP Technical Specification & Setup Guide",
      "description": "Hosted Model Context Protocol (MCP) service for querying Google Gemini API documentation, with configuration guides for Gemini CLI, Claude Code, and Codex.",
      "inLanguage": "en",
      "author": {
        "@type": "Person",
        "name": "stupidloud"
      }
    }
    </script>

    <style>
        :root {
            --bg-color: #faf9f6; /* Warm paper color */
            --text-color: #1a1a1a;
            --text-muted: #4a4a4a;
            --border-color: #d3d1cb;
            --code-bg: #f4f3ef;
            --link-color: #b85a00; /* Subtle rust/earthy accent */
            --link-hover: #e06d00;
            
            --font-serif: "Georgia", "Times New Roman", "Times", serif;
            --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            --font-mono: "Fira Code", "Courier New", Courier, monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--font-serif);
            line-height: 1.75;
            padding: 2rem 1rem;
            max-width: 780px;
            margin: 0 auto;
        }

        header {
            border-bottom: 2px double var(--border-color);
            padding-bottom: 1.5rem;
            margin-bottom: 2.5rem;
            text-align: center;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--text-color);
            text-decoration: none;
            letter-spacing: -0.01em;
        }

        .logo span {
            font-family: var(--font-sans);
            font-size: 0.8rem;
            font-weight: 500;
            vertical-align: middle;
            margin-left: 0.5rem;
            color: var(--text-muted);
            border: 1px solid var(--border-color);
            padding: 0.1rem 0.4rem;
            border-radius: 3px;
        }

        .meta-info {
            font-family: var(--font-sans);
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
        }

        .meta-info a {
            color: var(--text-muted);
            text-decoration: none;
            border-bottom: 1px dashed var(--border-color);
        }

        .meta-info a:hover {
            color: var(--text-color);
            border-bottom-style: solid;
        }

        main {
            margin-bottom: 4rem;
        }

        h1 {
            font-size: 2.2rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
            text-align: center;
        }

        .subtitle {
            font-style: italic;
            color: var(--text-muted);
            text-align: center;
            font-size: 1.15rem;
            margin-bottom: 2.5rem;
            line-height: 1.5;
        }

        h2 {
            font-size: 1.4rem;
            font-weight: 700;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.3rem;
        }

        p {
            margin-bottom: 1.25rem;
            text-align: justify;
        }

        ul, ol {
            margin-bottom: 1.25rem;
            padding-left: 1.75rem;
        }

        li {
            margin-bottom: 0.5rem;
        }

        a {
            color: var(--link-color);
            text-decoration: none;
            border-bottom: 1px solid transparent;
        }

        a:hover {
            color: var(--link-hover);
            border-bottom-color: var(--link-hover);
        }

        /* Technical specifications table */
        .specs-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-family: var(--font-sans);
            font-size: 0.9rem;
        }

        .specs-table th, .specs-table td {
            border: 1px solid var(--border-color);
            padding: 0.6rem 0.8rem;
            text-align: left;
        }

        .specs-table th {
            background-color: var(--code-bg);
            font-weight: 600;
        }

        /* Code display blocks */
        .code-container {
            position: relative;
            background-color: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
            margin: 1.25rem 0;
        }

        .code-container pre {
            margin: 0;
            font-family: var(--font-mono);
            font-size: 0.9rem;
            overflow-x: auto;
            color: #2b2b2b;
            white-space: pre-wrap;
            word-break: break-all;
        }

        .copy-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background-color: var(--bg-color);
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            font-family: var(--font-sans);
            font-size: 0.75rem;
            padding: 0.2rem 0.5rem;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.1s ease;
        }

        .copy-btn:hover {
            color: var(--text-color);
            border-color: var(--text-color);
        }

        .copy-btn.copied {
            background-color: #e2ecc8;
            border-color: #8c9c61;
            color: #4a5a2a;
        }

        code {
            font-family: var(--font-mono);
            background-color: var(--code-bg);
            padding: 0.15rem 0.3rem;
            font-size: 0.9em;
            border-radius: 3px;
            color: #2b2b2b;
        }

        .note-block {
            border-left: 3px solid var(--border-color);
            padding-left: 1rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: var(--text-muted);
        }

        footer {
            border-top: 1px solid var(--border-color);
            padding-top: 1.5rem;
            margin-top: 3rem;
            font-family: var(--font-sans);
            font-size: 0.8rem;
            color: var(--text-muted);
            text-align: center;
        }

        footer p {
            text-align: center;
            margin-bottom: 0.5rem;
        }

        @media (max-width: 600px) {
            body {
                padding: 1.5rem 0.75rem;
            }
            h1 {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>

    <header>
        <a href="/" class="logo" id="logo-link">Gemini Docs MCP<span>v0.1.0</span></a>
        <div class="meta-info">
            <span>License: MIT</span>
            <span>·</span>
            <a href="https://github.com/stupidloud/gemini-api-docs-mcp" target="_blank" rel="noopener noreferrer" id="nav-github">Source Repository</a>
        </div>
    </header>

    <main>
        <article>
            <h1 id="main-title">Gemini API Docs MCP</h1>
            <p class="subtitle">A Technical Specification and Installation Guide for AI Coding Agents</p>

            <section id="introduction">
                <h2>1. Introduction</h2>
                <p>
                    The <strong>Gemini API Docs MCP</strong> is a hosted service operating on the <a href="https://modelcontextprotocol.org/" target="_blank" rel="noopener noreferrer">Model Context Protocol</a> (MCP) standard. It is designed to act as a structured semantic bridge, providing large language models (LLMs) and automated coding agents with real-time, low-latency access to the official Google Gemini API documentation.
                </p>
                <p>
                    To maintain accurate documentation, the server automatically reads and updates its indexes from the official Gemini index. All documents are stored in a Cloudflare D1 SQL database and indexed via a SQLite FTS5 virtual table, allowing fast BM25 search queries directly from your development client.
                </p>
            </section>

            <section id="specifications">
                <h2>2. Service Specifications</h2>
                <table class="specs-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Specification Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Public SSE Endpoint</strong></td>
                            <td><code>https://gemini-docs.dev/mcp</code></td>
                        </tr>
                        <tr>
                            <td><strong>Platform Environment</strong></td>
                            <td>Cloudflare Workers, D1 SQL Database</td>
                        </tr>
                        <tr>
                            <td><strong>FTS Tokenizer</strong></td>
                            <td>SQLite <code>fts5(unicode61)</code></td>
                        </tr>
                        <tr>
                            <td><strong>Available MCP Tools</strong></td>
                            <td>
                                <ul>
                                    <li><code>search_documentation(queries)</code></li>
                                    <li><code>get_capability_page(capability)</code></li>
                                    <li><code>get_current_model()</code></li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section id="installation">
                <h2>3. Client Integration Setup</h2>
                <p>
                    Follow the instructions below to register the remote server into your specific agent's toolset.
                </p>

                <h3>3.1. Gemini CLI</h3>
                <p>
                    The Gemini CLI native environment is the primary client. Install the extension using the CLI's packaging commands:
                </p>
                <div class="code-container">
                    <button class="copy-btn" id="btn-copy-gemini" onclick="copyCode('btn-copy-gemini', 'code-gemini')">Copy</button>
                    <pre id="code-gemini">gemini extensions install stupidloud/gemini-api-docs-mcp</pre>
                </div>
                <p>
                    After completing the installation process, restart your Gemini CLI. Verify the connection by invoking the system commands:
                </p>
                <div class="code-container">
                    <pre>/extensions list\n/mcp</pre>
                </div>

                <h3>3.2. Claude Code</h3>
                <p>
                    Anthropic's Claude Code supports adding remote tools via Server-Sent Events (SSE). Register the server dynamically in your workspace:
                </p>
                <div class="code-container">
                    <button class="copy-btn" id="btn-copy-claude" onclick="copyCode('btn-copy-claude', 'code-claude')">Copy</button>
                    <pre id="code-claude">claude mcp add --transport sse gemini-docs https://gemini-docs.dev/mcp</pre>
                </div>
                <div class="note-block">
                    Note: The configuration can be scoped to user-level (<code>~/.claude.json</code>) or project-level (<code>.mcp.json</code>) using the <code>--scope</code> option. Verify the tool state within the console via the <code>/mcp</code> command.
                </div>

                <h3>3.3. Codex (OpenAI Coding Agent)</h3>
                <p>
                    For Codex environments, register the server by manually editing your project-scoped config (<code>.codex/config.toml</code>) or global config (<code>~/.codex/config.toml</code>):
                </p>
                <div class="code-container">
                    <button class="copy-btn" id="btn-copy-codex" onclick="copyCode('btn-copy-codex', 'code-codex')">Copy</button>
                    <pre id="code-codex">[mcp_servers.gemini-docs]
url = "https://gemini-docs.dev/mcp"
enabled = true</pre>
                </div>
                <div class="note-block">
                    Note: If you are using project-scoped configuration, run <code>codex trust</code> to permit tool execution. Restart Codex to load the tools.
                </div>
            </section>
        </article>
    </main>

    <footer>
        <p>Gemini API Docs MCP &copy; 2026. Built on Cloudflare Workers &amp; Model Context Protocol.</p>
        <p>Maintained by <a href="https://github.com/stupidloud" target="_blank" rel="noopener noreferrer">stupidloud</a>.</p>
    </footer>

    <script>
        function copyCode(btnId, preId) {
            const btn = document.getElementById(btnId);
            const pre = document.getElementById(preId);
            const text = pre.innerText;

            navigator.clipboard.writeText(text).then(() => {
                btn.innerText = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerText = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    </script>
</body>
</html>`;
}
