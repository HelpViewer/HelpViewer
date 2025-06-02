# HelpViewer

A simple reader for ZIP archives containing markdown files, intended to serve as a help file viewer similar to those found in older Windows systems - [HTML Help Viewer][HTMLHW] and [WinHelp][WinHlp32].

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
| **./hvdata/jszip** | [JSZip][JSZIP] - ZIP archives manipulation library |
| **./hvdata/appmain.js** | Javascript part of solution |

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

[HTMLHW]: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/htmlhelp/about-the-html-help-viewer "HTML Help Viewer"
[WinHlp32]: https://blog.butras.cz/2013/11/jiz-od-verze-windows-vista-jiz-neni.html "WinHlp32"
[JSZIP]: http://jszip.org/ "JSZip JavaScript library - ZIP files manipulation"
[Marked]: https://marked.js.org/ "Marked JavaScript library - md files to HTML renderer"
[Structure]: FileMetadata.md "File metadata"
[FuturePlans]: FuturePlans.md "Future plans list"
[Mermaid]: https://mermaid.js.org/ "Mermaid library - renderer for diagrams defined by specific textual definitions"
[bypassCORS]: #cors-policy "Browser possibly blocking local file access (file://) due to CORS policy restrictions"