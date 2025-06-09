# Future plans

- Support old help CHM file format with defined conversion steps.
- Prepare description help ZIP file for the solution.
- Left panel with multi pages:
  - Search (fulltext search in ZIP file - investigation if possible), 
  - User notes list and links to headings inside documents
- Possibility to add custom user note to anchor (heading) + data management in separated ZIP
- Custom help file HTML layout support (appendable to body + refactor)
- Splash screen for helpfile
- In commit 1119768 there has been done try with scratch image, but failed so alpine was used. Retry it.
- Nice URLs (?id=5&d=...&p=... vs /hello.md/3)
- Event bus instead of interconnections
- RSS generator
- sitemap.xml
- Author help
- Editor for creating help files (possibly also sh scripts for build full text search)
- Improve reading of markdowns - filter out YAML, TOML, JSON headings (currently not touching them) - getting information partially from them
- Allow synonyms in keywords: chair -> chair;armchair;throne -> one row will be divided into 3 words with the same mapping
