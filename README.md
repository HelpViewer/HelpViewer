# HelpViewer

A simple reader for ZIP archives containing markdown files, intended to serve as a help file viewer similar to those found in older Windows systems - [HTML Help Viewer][HTMLHW] and [WinHelp][WinHlp32] - with single-file deployment.

## How does it works

1. You will open **HelpViewer.htm** file in your browser.
2. Then you will populate parameter **?d=X** where X will be your ZIP file path where all markdown files for your help file are present.

## Used 3rd party products

- [JSZip library][JSZIP]
- [Marked][Marked]

## Future plans

- HLP file browsing will not be supported (at least not for now).
- Support old help CHM file format with defined conversion steps.

## About AI Assistance

Some parts of this project were developed with assistance from:

- ChatGPT, 
- Copilot

, an AI-powered advisor. 
While AI helped generate suggestions, the final code and design decisions were made by the project author.

Please note that any use of third-party code generated or suggested by AI is subject to the original licenses of that code.

[HTMLHW]: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/htmlhelp/about-the-html-help-viewer "HTML Help Viewer"
[WinHlp32]: https://blog.butras.cz/2013/11/jiz-od-verze-windows-vista-jiz-neni.html "WinHlp32"
[JSZIP]: http://jszip.org/ "JSZip JavaScript library"
[Marked]: https://marked.js.org/ "Marked JavaScript library"