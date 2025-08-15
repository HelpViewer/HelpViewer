class puiButtonAsBook extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ShowAsBook';
    this.DEFAULT_KEY_CFG_CAPTION = '📚';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }

  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    const homeData = sendEvent('GetHomePageData') || '';
    const tocData = sendEvent('GetTOCData') || Promise.resolve([]);

    tocData.then((x) => {
      var files = [];
      files.push(homeData);
      rowsToArray(x).forEach(line => {
        const file = line.slice(line.lastIndexOf("|") + 1);
        if (file && resolveFileMedium(file) != UserDataFileLoadedFileType.NETWORK && !file.startsWith('='))
          files.push(file);
      });
      files = [...new Set(files)];

      var textOfFiles = '';
      var prom = Promise.resolve();

      files.forEach((x) => {
        prom = prom.then(() => (x.startsWith(':') ? storageSearch(STO_DATA, x.substring(1)) : storageSearch(STO_HELP, x)).then((y) => {
          if (y.length > 0)
            textOfFiles += '\n' + y + '\n' + DIRECTIVE_PRINT_PAGEBREAK;

          if (x == homeData) {
            const data = $('tree')?.outerHTML;

            if (data && data.length > 0)
              textOfFiles += '\n' + data + '\n' + DIRECTIVE_PRINT_PAGEBREAK + '\n';
          }

          return Promise.resolve();  
        }));
      });
      var refs = [];
      prom = prom.then(() => {
        textOfFiles = textOfFiles.replace(/^\[[^\]]+\]:\s+.+$/gm, (match) => {
          refs.push(match);
          return '';
        });
      });
      prom = prom.then(() => {
        textOfFiles = textOfFiles.slice(0, -(DIRECTIVE_PRINT_PAGEBREAK + '\n').length);
        textOfFiles += `\n${refs.join('\n')}`;
        showChapter(undefined, undefined, homeData, undefined, textOfFiles);
      });

    });

  }

  onET_ChapterShown(evt) {
    setHeader(evt.heading);
  }

}

Plugins.catalogize(puiButtonAsBook);
