# Future plans

- Imports - Support old help CHM file format with defined conversion steps. (or possible more formats like RTF)
- Nice URLs (?id=5&d=...&p=... vs /hello.md/3)
- Editor for creating help files (+ WYSIWYG editor)
- Improve reading of markdowns - filter out YAML, TOML, JSON headings (currently not touching them) - getting information partially from them
- Converting TEX file from archive to md format (investigation if possible, base support only?)
- Improve WCAG and other standards
- United help system (grouping of single help files (united tree and dictionaries) - currently only links outside helpfile are allowed)
- Associated topics groups (something like links/keywords/topics, see also )
- Dead links checker (links, URI, images)
- Discussion (e.g.: Disqus or other service) plugin, Feedback loop, visitor flow analysis/logging
- prod logs to console, debug logs to custom tool
- custom log explorer
- add jsdoc and auto parse of it
- text bubbles
- glossary list page (pages with single letter and word list)
- wizard with points and buttons
- Github and another repository services (appGHIntegration.js refactor) - one concept prepared
- User bookmarks across help pages / User bookmarks to chapters (?, browser bookmarks also exists)
- MCP server - export, showChapter
- RAG search
- pExportSTATIC : RSS feed generation : pubDate - verify if CI/CD script preserves last commit date time on files when cloning back to CI container when help ZIP is being packaged for deploy (check action step: chetan/git-restore-mtime-action@v2 ; command: git restore-mtime ) , zkusit: const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Ahoj'));
const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); (partially solved by other way in process, but think idea in general)
- Single-Sourcing (snippets, conditional tags blocks, per roles text versions + dynamic content filtering)
- Export to SCORM (e-learning)
