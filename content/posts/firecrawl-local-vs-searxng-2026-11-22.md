---
title: "Discovery Is Not Extraction: Firecrawl Local vs SearXNG for Agentic RAG"
date: "2026-11-22"
category: "Minerva's Den"
tags: ["Agentic RAG", "Web Search", "Firecrawl", "SearXNG", "Local-first"]
stamp: "VERIFIED"
sources:
  - "https://www.firecrawl.dev/changelog/firecrawl-local"
  - "https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md"
  - "https://docs.searxng.org/dev/search_api.html"
  - "https://docs.searxng.org/dev/engines/engine_overview.html"
---

A local research agent needs to answer two different questions: **which pages contain the answer?** and **what do those pages actually say?** Confusing the two produces unnecessary infrastructure. It also explains why [Firecrawl Local](https://github.com/firecrawl/firecrawl/tree/main/apps/local), released on November 18, 2026, is being compared with [SearXNG](https://github.com/searxng/searxng), even though they do different jobs.

**Verdict upfront:** SearXNG remains useful as the discovery layer. Firecrawl Local can become a selective extraction layer after a URL is chosen; it is neither a replacement for federated search nor a requirement for every RAG stack. The distinction is documented in both projects' interfaces, not inferred from product positioning.

## The functional boundary is visible in the APIs

SearXNG is a *metasearch engine*: its adapters query external search services and aggregate results. An agent can ask a self-hosted instance for JSON:

```bash
curl 'http://localhost:8080/search?q=site%3Agithub.com+agentic+rag&format=json'
```

The hostname and port above are illustrative. [The official search API](https://docs.searxng.org/dev/search_api.html) supports GET/POST on `/` and `/search`, a `q` parameter, categories, language, pagination, and optional JSON/CSV/RSS output. **JSON is not guaranteed:** it must be enabled in `settings.yml`, and public instances often disable it. Search queries are forwarded to engines, so a Google-specific search operator need not behave identically on every backend. SearXNG handles discovery and ranking, not conversion of an arbitrary selected document into clean Markdown.

Firecrawl Local does the opposite work. Its [official README](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md) documents a Rust binary with local `scrape`, `crawl`, `map`, and batch-scrape operations, exposing a subset of Firecrawl's v2 API on `127.0.0.1:3002` or an MCP adapter. The core actions are materially distinct:

| Question an agent asks | SearXNG | Firecrawl Local |
| --- | --- | --- |
| Which pages match a topic across search services? | Federated search results | Its `search` is delegated to Firecrawl Cloud |
| What is the actual content of this selected URL? | Does not provide a general Markdown extraction API | Locally returns cleaned Markdown/HTML, raw HTML, or links |
| Which pages exist under a documentation site? | Search may find some pages | Local `map` uses a site's sitemap and entry page; `crawl` follows links |
| Does a JavaScript-rendered page need a browser? | Search results do not solve rendering | Can use installed Chrome/Chromium for local rendering |
| Can I normalize PDFs or Office documents? | Not a general document parser | Local parsing supported |
| Can I request full cloud-grade structured JSON, screenshots and browser actions? | No | Not equivalently: these are Cloud capabilities or local limitations |

This is not a benchmark table; it is a capability boundary assembled from the [Firecrawl Local documentation](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md) and [SearXNG engine architecture](https://docs.searxng.org/dev/engines/engine_overview.html). A site map is also not a global search index. Knowing every URL on one domain does not tell an agent which domain it should visit.

## What "local" actually guarantees

The November 18 [release announcement](https://www.firecrawl.dev/changelog/firecrawl-local) advertises **37× faster scraping** than Firecrawl's former self-hosted stack and **230× less idle memory**, with **11 MB idle** for the new Rust primitive. Those are publisher-reported figures with a specific baseline: the old Firecrawl self-hosted implementation. They are **not** measurements against SearXNG, not end-to-end research-agent latency, and not evidence that a JavaScript-heavy Chromium session consumes 11 MB. No independently reproduced, matched Mac mini benchmark accompanies that announcement.

Firecrawl Local also has a less obvious privacy boundary. As its README states, search runs through Firecrawl Cloud, not a local web index. In the default `FIRECRAWL_CLOUD=auto` mode, a scrape that fails locally may also be sent to Firecrawl Cloud; the returned item is marked with `"source": "firecrawl-cloud"`. Alexandria data-provider calls are cloud features. Thus a locally installed binary does **not** by itself imply that every document request stays on the machine.

For a strict local extraction path:

```bash
cargo install firecrawl-local
FIRECRAWL_CLOUD=off firecrawl-local serve
```

A Firecrawl SDK can then target `http://localhost:3002`; this service provides `POST /v2/scrape`, `/v2/map`, `/v2/crawl`, and batch scrape endpoints. The older v0/v1 API routes are not served. Crawl and batch jobs live in memory and expire after an hour; they are not a durable queue. Local `json` and `summary` extraction formats are skipped with warnings.

The MCP route uses `firecrawl-local mcp`, and according to the README needs Node.js 22+ because it launches the `firecrawl-mcp` package via `npx`. Local CLI scraping itself is not thereby converted into a Node runtime.

## The security boundary is as important as the speed

The [README's security section](https://github.com/firecrawl/firecrawl/blob/main/apps/local/README.md#security) makes a surprising distinction: direct `scrape`, `crawl`, `map` and `mcp` commands may access localhost and private-network addresses by default; `serve` instead binds loopback and rejects private destinations unless explicitly allowed. This matters if the URL originates in an untrusted search result or in a page containing instructions addressed to an agent.

For agents browsing untrusted sites, use the documented MCP restriction:

```bash
firecrawl-local mcp --public-only
```

That does not make fetched pages trustworthy. Treat extracted text as data rather than authority to open another URL, execute a command or change application state. Firecrawl Local also applies link-local/cloud-metadata restrictions and browser-proxy safeguards described in its README. Browser rendering still carries actual browser resource cost and site-access constraints.

SearXNG has a different operational risk. Its external search engines can fail, change markup, rate-limit or challenge automated requests. The project's [engine architecture](https://docs.searxng.org/dev/engines/engine_overview.html) explicitly relies on per-engine adapters, while [its limiter documentation](https://docs.searxng.org/admin/searx.limiter) documents bot filtering on instances. A self-hosted aggregator improves control of the interface, but cannot guarantee access to every upstream engine.

## The RAG pipeline that follows from these constraints

For an agent that revises queries and checks several sources, the division of labor is straightforward:

1. **Discovery:** Send rewritten topical queries to a SearXNG instance with JSON output enabled. Deduplicate and group URLs before fetching.
2. **Extraction:** For selected authoritative URLs, first use the simplest reliable fetch/HTML-to-text path already in the stack. Escalate to Firecrawl Local when link discovery, JavaScript rendering, PDFs or cleaning fidelity warrant it.
3. **Verification:** Record the original URL, retrieval time, page title, and whether extraction used a browser or a cloud fallback. Reject empty/blocked pages instead of presenting them as evidence.
4. **Synthesis and retrieval:** Chunk or index documents when reuse justifies it; keep source anchors for claims, then requery if evidence coverage is weak. Neither search nor scraping alone implements agentic RAG's evidence-checking loop.

Firecrawl's own [README](https://github.com/firecrawl/firecrawl) distinguishes Local from the full self-hosted server with databases, workers and queues. Installing the larger server to scrape a few pages is a different engineering commitment from running the Rust primitive.

**Engineering conclusion:** keep SearXNG when the problem is finding sources; add Firecrawl Local only where the existing fetcher demonstrably loses content or when domain crawling and document normalization are needed. Use `FIRECRAWL_CLOUD=off` for a deliberately local data boundary, inspect extraction warnings, and do not quote a vendor's 37× figure as a measured research-agent speedup. If a simple HTTP fetch already yields clean text for the workload, no additional Firecrawl service is justified.