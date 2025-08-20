class puiButtonAsBook extends puiButtonTab {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ShowAsBook';
    this.DEFAULT_KEY_CFG_CAPTION = '📚';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }

  init() {
    super.init();
    hideButton(this.button.id, false);
  }

  deInit() {
    super.deInit();
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, true);
  }

  _preShowAction(evt) {
    const nPageBreak = 'cbPageBreak';
    var fPageBreak = $(nPageBreak);

    if (fPageBreak)
      this.tab.innerText = '';

    appendField(this.tab, nPageBreak, undefined, FormFieldType.CHECKBOX);

    const nIcons = 'IconPrint';
    appendFieldComboBox(this.tab, nIcons);
    const fIcons = $(nIcons);
    const items = _T('IconPrintItems')?.split(';');
    appendComboBoxItems(fIcons, items, getUserConfigValue(KEY_LS_PRINTICONS));

    registerOnClick(nIcons, (evt) => {
      setUserConfigValue(KEY_LS_PRINTICONS, fIcons?.value);
    });

    fPageBreak = $(nPageBreak);
    //fPageBreak.checked = true;
    this.fPageBreak = fPageBreak;
    this.fIcons = fIcons;
  }

  _buttonAction(evt) {
    if (this.tab.classList.contains(C_HIDDENC)) {
      super._buttonAction();
    } else {
      const tocData = sendEvent('GetTOCData') || Promise.resolve([]);
      this.homeData = sendEvent('GetHomePageData') || '';
      const homeData = this.homeData;
  
      var files = [];
      files.push(homeData);
  
      tocData.then((x) => {
        const result = rowsToArray(x);

        if (result)
          files.push(...result);

        files.forEach(line => {
          const file = line.slice(line.lastIndexOf("|") + 1);
          if (file && resolveFileMedium(file) != UserDataFileLoadedFileType.NETWORK && !file.startsWith('='))
            files.push(file);
        });
        this.files = files;
        this._prepareDump(homeData, files)
      });
    }
  }

  _prepareDump(homeData, files) {
    const PAGE_BREAK = this.fPageBreak.checked ? DIRECTIVE_PRINT_PAGEBREAK : '';
    var textOfFiles = '';
    var prom = Promise.resolve();

    files = files.map(f => f.split("#")[0]);
    files = [...new Set(files)];
    files = files.filter(f => !/^(ftp|https|\?d=|=)/.test(f));

    files.forEach((x) => {
      prom = prom.then(() => (x.startsWith(':') ? storageSearch(STO_DATA, x.substring(1)) : storageSearch(STO_HELP, x)).then((y) => {
        if (y.length > 0) {
          textOfFiles += '\n' + y + '\n';

          if (x == homeData) {
            const metainfo = `\n| ${_T('helpfile')} | ${_T('version')} |\n|---|---|\n| ${configGetValue(CFG_KEY__PRJNAME)} | ${configGetValue(CFG_KEY__VERSION)} |\n| ${configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT)} | ${configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT)} |\n| ${_T('source')} | ${dataPath} |\n| ${_T('date')} | ${getDateInYYYYMMDDHH24IIss(new Date())} |\n\n`;
            textOfFiles += metainfo;
            textOfFiles += PAGE_BREAK;
            //textOfFiles += metainfo;
            //textOfFiles += `\n<b>${_T('helpfile')}: ${configGetValue(CFG_KEY__PRJNAME)} <br>${_T('version')}: ${configGetValue(CFG_KEY__VERSION)}</b>`;
            const tree = $('tree');
            const data = tree?.outerHTML;

            if (data && data.length > 0 && tree?.childNodes.length > 0) {
              textOfFiles += `\n# ${_T('downP-TopicTree')}\n`;
              textOfFiles += '\n' + data + '\n' + PAGE_BREAK + '\n';
            }
          } else {
            textOfFiles += PAGE_BREAK + '\n';
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
      textOfFiles = textOfFiles.slice(0, -(PAGE_BREAK + '\n').length);
      textOfFiles += `\n${refs.join('\n')}`;
      if (!PAGE_BREAK)
        textOfFiles = textOfFiles.replace(new RegExp(DIRECTIVE_PRINT_PAGEBREAK, 'g'), '');
      reply = showChapter(undefined, undefined, homeData, undefined, textOfFiles);
      sendEvent('ShowBookmarks');
      return reply;
    }).then(() => sendEvent(evtHideIfTooWide));
  }

  onET_ChapterShown(evt) {
    if (!this.files)
      return;
    setHeader(evt.heading);
    
    const toc = $O('#tree', evt.doc);
    const cssName = 'tmp-AsBook';
    $(cssName)?.remove();

    if (toc && this.fIcons.value != 1) {
      appendCSS(cssName,
        `#content ul.tree details > summary::before { content: '>'; }
        #content ul.tree details[open] > summary::before { transform: rotate(0deg); content: '˅'; }`);
    }

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
    } else {
      this.files = undefined;
    }
  }

}

Plugins.catalogize(puiButtonAsBook);

function getDateInYYYYMMDDHH24IIss(date) {
  const pad = n => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
