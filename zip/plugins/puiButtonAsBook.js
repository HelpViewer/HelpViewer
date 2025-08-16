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
    const tocData = sendEvent('GetTOCData') || Promise.resolve([]);
    this.homeData = sendEvent('GetHomePageData') || '';
    const homeData = this.homeData;

    var files = [];
    files.push(homeData);

    tocData.then((x) => {
      rowsToArray(x).forEach(line => {
        const file = line.slice(line.lastIndexOf("|") + 1);
        if (file && resolveFileMedium(file) != UserDataFileLoadedFileType.NETWORK && !file.startsWith('='))
          files.push(file);
      });
      files = [...new Set(files)];
      files = files.filter(f => !/^(ftp|https|\?d=|=)/.test(f));
      this.files = files;
      this._prepareDump(homeData, files)
    });
  }

  _prepareDump(homeData, files) {
    var textOfFiles = '';
    var prom = Promise.resolve();

    files.forEach((x) => {
      prom = prom.then(() => (x.startsWith(':') ? storageSearch(STO_DATA, x.substring(1)) : storageSearch(STO_HELP, x)).then((y) => {
        if (y.length > 0) {
          textOfFiles += '\n' + y + '\n';

          if (x == homeData) {
            const metainfo = `\n| ${_T('helpfile')} | ${_T('version')} |\n|---|---|\n| ${configGetValue(CFG_KEY__PRJNAME)} | ${configGetValue(CFG_KEY__VERSION)} |\n| ${configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT)} | ${configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT)} |\n| ${_T('source')} | ${dataPath} |\n`;
            textOfFiles += metainfo;
            textOfFiles += DIRECTIVE_PRINT_PAGEBREAK;
            textOfFiles += metainfo;
            //textOfFiles += `\n<b>${_T('helpfile')}: ${configGetValue(CFG_KEY__PRJNAME)} <br>${_T('version')}: ${configGetValue(CFG_KEY__VERSION)}</b>`;
            const data = $('tree')?.outerHTML;

            if (data && data.length > 0)
              textOfFiles += '\n' + data + '\n' + DIRECTIVE_PRINT_PAGEBREAK + '\n';
          } else {
            textOfFiles += DIRECTIVE_PRINT_PAGEBREAK + '\n';
          }
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
    
    this.chapterText = '';

    var reply = undefined;
    prom = prom.then(() => {
      textOfFiles = textOfFiles.slice(0, -(DIRECTIVE_PRINT_PAGEBREAK + '\n').length);
      textOfFiles += `\n${refs.join('\n')}`;
      reply = showChapter(undefined, undefined, homeData, undefined, textOfFiles);
      return reply;
    });
  }

  onET_ChapterShown(evt) {
    setHeader(evt.heading);
    var links = Array.from($A('a', evt.doc))
      .map(a => a.getAttribute('data-param'))
      .filter(v => v && !/^(ftp|https|\?d=|=|#|@|:)/.test(v));
    links = [...new Set(links)];
    links = links.filter(v => !this.files.includes(v));
    if (links.length > 0)
    {
      this.files.push(...links);
      var files = [...new Set(this.files)];
      this._prepareDump(this.homeData, files);
    }
  }

}

Plugins.catalogize(puiButtonAsBook);
