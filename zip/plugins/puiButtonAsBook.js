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
            textOfFiles += '\n' + y + DIRECTIVE_PRINT_PAGEBREAK;

          return Promise.resolve();  
        }));
      });
      prom.then(() => {
        var reply = showChapter(undefined, undefined, '.md', undefined, textOfFiles);
        //textOfFiles = reply.content;
        //reply = showChapter(undefined, undefined, '.htm', undefined, textOfFiles);
      });
    });

  }

  onET_ChapterShown(evt) {
    setHeader(evt.heading);
  }

}

Plugins.catalogize(puiButtonAsBook);
