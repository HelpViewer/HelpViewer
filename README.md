# HelpViewer

A lightweight and simple reader for ZIP archives containing Markdown and HTML files, designed as a modern and portable help file viewer.
It supports offline usage without a backend or local server, providing a clean and responsive interface inspired by classic desktop help viewers from the Windows era.

## Features

- No installation required - just unzip and run locally
- Multiplatform - works on all major operating systems via web browsers
- Ready to work in offline mode without any backend or local server (requires disabling CORS in web browser)
- Simple user interface
- Responsive (desktop and other devices supported)
- Seamless full-screen expansion of topic content
- Hierarchical view of topics (collapsible topic tree)
- Integrated topic navigation buttons
- Bookmarks for chapters supported
- Four native color schemes: color (default), greyscale, white on black, and black on white
- Print friendly version (prefers greyscale)
- Tooltips in English (other languages planned)
- Lightweight - under 1 MiB, 4 files + 1 subfolder (most part of solution compressed)

## Features for authors

- Single platform for rendering Markdown and HTML content (both can be present in one help ZIP file)
- ZIP compression method supported (one single part file only)
- Rendering diagrams by Mermaid library (included in deployment package)
- Syntax highlighting for code blocks
- Flexible customization of appearance and functionality
- Automated CI/CD release pipeline (package: 1 ZIP file)
- Open-source and extendable code
- MIT license

## How it works

1. Start your browser with [CORS restrictions][bypassCORS] disabled.
2. In this session you will open **HelpViewer.htm** file in your browser.
3. Then you will populate parameter **?d=X** where X will be your ZIP file path where all markdown files for your help file are present. If you will skip this step, then **./Help.zip** will be used as default value.

## Used 3rd party products

- [JSZip library][JSZIP]
- [Marked][Marked]
- [Mermaid][Mermaid]

## Minimal deployment package

- ./ = your local directory

| File | Purpose |
|---|---|
| **./HelpViewer.htm** | Main launch file |
| **./hvdata/data.zip** | Compressed 3rd party product redistributables (javascripts) |
| ./hvdata/data.zip:marked.min.js | [Marked][Marked] - md files to HTML renderer |
| ./hvdata/data.zip:mermaid.min.js | [Mermaid][Mermaid] - renderer for diagrams defined by specific textual definitions |
| ./hvdata/data.zip:layout.htm | Default viewer GUI layout |
| ./hvdata/data.zip:main.css | Default viewer CSS styles |
| ./hvdata/data.zip:appmainRun.js | Application runner |
| ./hvdata/data.zip:appmainNext.js | Javascript part of application |
| ./hvdata/data.zip:app*.js | Application features and submodules |
| ./hvdata/data.zip:lang/* | Translation strings |
| ./hvdata/data.zip:lang/?/lname.txt | Language friendly name |
| ./hvdata/data.zip:lang/?/lstr.txt | Language strings (static) |
| ./hvdata/data.zip:lang/?/lstr.js | Language strings (with dynamic data support) |
| ./hvdata/data.zip:_version.txt | Application version (GitHub release name) |
| **./hvdata/jszip.min.js** | [JSZip][JSZIP] - ZIP archives manipulation library |
| **./hvdata/appmain.js** | Basic application runner for operation with JSZip |

## Troubleshooting

- The solution is implemented using pure JavaScript. Please ensure that JavaScript is enabled in your browser to ensure proper functionality.

### CORS policy

Page not reading ZIP content? This may be caused by your browser blocking local file access (file://) due to CORS policy restrictions. 
You need to run your browser in mode with bypass CORS policy:
- Firefox:
  > Address bar: 
  about:config
  > 
  > search:
  privacy.file_unique_origin
  > 
  > set to:
  false
  
- Chrome:
  > Run in CLI:
  > chrome.exe --disable-site-isolation-trials --disable-web-security --user-data-dir="C:\temp"

## Data files structure

- [Metadata structure description][Structure]

## Future plans

- HLP file browsing will not be supported (at least not for now).
- The previous goal of single-file deployment is no longer possible.
- More [Future plans][FuturePlans].

## About AI Assistance

Some parts of this project were developed with assistance from:

- ChatGPT, 
- Copilot

, an AI-powered advisor. 
While AI helped generate suggestions, the final code and design decisions were made by the project author.

Please note that any use of third-party code generated or suggested by AI is subject to the original licenses of that code.

[JSZIP]: http://jszip.org/ "JSZip JavaScript library - ZIP files manipulation"
[Marked]: https://marked.js.org/ "Marked JavaScript library - md files to HTML renderer"
[Structure]: FileMetadata.md "File metadata"
[FuturePlans]: FuturePlans.md "Future plans list"
[Mermaid]: https://mermaid.js.org/ "Mermaid library - renderer for diagrams defined by specific textual definitions"
[bypassCORS]: #cors-policy "Browser possibly blocking local file access (file://) due to CORS policy restrictions"