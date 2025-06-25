# HelpViewer

HelpViewer is a lightweight and simple reader for ZIP archives or directories—whether stored locally or on a network—containing Markdown and HTML files. It’s designed as a modern and portable help file viewer that runs directly in your web browser.

It supports offline use without requiring any backend or server, offering a clean and responsive interface inspired by the classic desktop help viewers from the Windows era.

HelpViewer is [MIT licensed][MITL].

Open this file in [HelpViewer][OpenInViewer] to see it in action, or visit our [website][website] to learn more.

Interested? Download the latest HelpViewer [release package][PackLatest] and feel free to join our [Discord][Discord] user group.

## Features

- No installation required - just unzip and run locally
- Multiplatform - works on all major operating systems via web browsers
- Ready to work in offline mode without any backend or local server (requires disabling CORS in web browser)
- Responsive (desktop and other devices supported)
- Lightweight - distribution package under 1 MiB (most part of solution compressed)

## Features for authors

- Single platform for rendering Markdown and HTML content (both can be present in one help ZIP file)
- ZIP compression method supported (one single part file only)
- Rendering diagrams by Mermaid library (included in deployment package)

## How it works

1. Start your browser with [CORS restrictions][bypassCORS] disabled.
2. In this session you will open **index.html** file in your browser.
3. Set the URL parameter **?d=X**, where **X** is the path to your ZIP file or you can define path ending with **/** if you want to read a directory.  
   If you skip this step, **./hlp/Help-{current language}.zip** will be used by default.

## Used 3rd party products

- [JSZip library][JSZIP]
- [Marked][Marked]
- [Mermaid][Mermaid]

## Troubleshooting

The solution is implemented using pure JavaScript. Please ensure that JavaScript is enabled in your browser to ensure proper functionality.

### CORS policy

Page not reading ZIP content or directory? This may be caused by your browser blocking local file access (file://) due to CORS policy restrictions. 
You need to run your browser in mode with bypass CORS policy:
 
- Chrome:
  > Run in CLI:
  > chrome.exe --disable-site-isolation-trials --disable-web-security --user-data-dir="C:\temp"

- Edge:
  > Run in CLI:
  > msedge --disable-web-security --user-data-dir="C:\temp"

## Future plans

- More in [Future plans][FuturePlans] list.

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
[MITL]: LICENSE "License text"
[website]: https://helpviewer.github.io/ "Project introduction"
[OpenInViewer]: https://helpviewer.github.io/?d=https://raw.githubusercontent.com/HelpViewer/HelpViewer/master/ "Open this file in HelpViewer"
[Discord]: https://discord.gg/J2SjcmqHSZ "Discord user gorup"
[PackLatest]: https://github.com/HelpViewer/HelpViewer/releases/latest "HelpViewer latest release package"
