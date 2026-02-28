class puiButtonAsBook extends puiButtonTab {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ShowAsBook';
    this.DEFAULT_KEY_CFG_CAPTION = '📚';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    this.DEFAULT_KEY_CFG_ADDITIONALINDEXFILES = '_sidebar.md;_navbar.md';
  }

  init() {
    super.init();
    hideButton(this.button.id, false);

    const TI = this;
    const hnd = TI._prepareDump;
    TI.catalogizeEventCall(hnd, EventNames.StorageGet);
    TI.catalogizeEventCall(hnd, EventNames.ShowChapter);
    TI.catalogizeEventCall(hnd, EventNames.ShowBookmarks);
    TI.catalogizeEventCall(hnd, evtHideIfTooWide);
    TI.catalogizeEventCall(TI._preShowAction, EventNames.UserConfigSet);
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

    const nExportDictionary = 'cbExportDictionary';
    appendField(this.tab, nExportDictionary, getUserConfigValue(KEY_LS_EXPORTDICT) == 1, FormFieldType.CHECKBOX);
    var fExportDictionary = $(nExportDictionary);

    registerOnClick(nExportDictionary, (evt) => {
      setUserConfigValue(KEY_LS_EXPORTDICT, fExportDictionary?.checked ? 1 : 0);
    });
  }

  _buttonAction(evt) {
    if (this.tab.classList.contains(C_HIDDENC)) {
      super._buttonAction();
    } else {
      const tocData = sendEvent(EventNames.GetTOCData) || Promise.resolve([]);
      this.homeData = getHomePageData() || '';
      const homeData = this.homeData;
  
      var files = [];
      files.push(homeData);
      files.push(...(this.cfgADDITIONALINDEXFILES?.split(';') || []));
  
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
    files = files.map(f => f.split("@@")[0]);
    files = files.map(f => f.split("?")[0]);
    files = files.map(f => f.startsWith('/') ? f.substring(1) : f);
    log('E FILES:', files);
    files = [...new Set(files)];
    files = files.filter(f => !/^(ftp|https|\?d=|=)/.test(f));

    files.forEach((x) => {
      prom = prom.then(() => (x.startsWith(':') ? storageSearch(STO_DATA, x.substring(1)) : storageSearch(STO_HELP, x)).then((y) => {
        if (y.length > 0) {
          const isHomeData = x == homeData;
          if (x.startsWith(':'))
            x = `_${x.slice(1)}`;
          const fileAnchor = isHomeData ? '' : `<a id="file-${x}" class="anchor-link"></a>\n`;
          textOfFiles += `\n${fileAnchor}${y}\n`;

          if (isHomeData) {
            const metainfo = `\n| ${_T('helpfile')} | ${_T('version')} |\n|---|---|\n| ${configGetDataProjectFile()} | ${configGetValue(CFG_KEY__VERSION) || ''} |\n| ${configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT)} | ${configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT)} |\n| ${_T('source')} | ${dataPath} |\n| ${_T('date')} | ${getDateInYYYYMMDDHH24IIss(new Date())} |\n\n${PAGE_BREAK}`;
            textOfFiles += metainfo;
            const tree = $('tree');
            const data = tree?.outerHTML;

            if (data && data.length > 0 && tree?.childNodes.length > 0)
              textOfFiles += `<a id="file-toc.htm" class="anchor-link"></a>\n\n# ${_T('downP-TopicTree')}\n\n${data}\n${PAGE_BREAK}\n`;
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
      sendEvent(EventNames.ShowBookmarks);
      return reply;
    }).then(() => sendEvent(evtHideIfTooWide));
  }

  onETChapterShown(evt) {
    if (!this.files)
      return;
    setHeader(evt.heading);
    
    const toc = $O('#tree', evt.doc);
    const cssName = 'tmp-AsBook';
    $(cssName)?.remove();

    if (toc) {
      openSubtree(toc);
      if (this.fIcons.value != 1) {
        appendCSS(cssName,
          `#content ul.tree details > summary::before { content: '>'; }
          #content ul.tree details[open] > summary::before { transform: rotate(0deg); content: '˅'; }`);
      }  
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
      const contentPane = $O('#content');
      let filesHeadings = Array.from($A('a.anchor-link', contentPane)).map(l => l.id || l.getAttribute('href'));
      filesHeadings = filesHeadings.reduce((map, item) => {
        if (item.startsWith('file-')) {
          const fileName = item.substring(5);
          if (!map[fileName])
            map[fileName] = [];
        } else {
          const lastKey = Object.keys(map).at(-1);
          if (lastKey)
            map[lastKey].push(item.substring(1));
        }
        return map;
      }, {});

      // Chapter links recounted to absolute anchors - orders and files if needed
      const linksAll = Array.from($A('a', contentPane));
      let currentFile = '';
      linksAll.forEach(link => {
        let dataLink = link.getAttribute('data-param') || link.getAttribute('href');

        if (!dataLink) {
          currentFile = link.getAttribute('id')?.substring(5);
          return;
        }

        if (link.classList.contains('anchor-link'))
          return;

        if (dataLink && !dataLink.startsWith('http')) {
          if (/^(?:\?d=|[:?])/.test(dataLink))
            link.setAttribute('href', '#');
          else
          if (/\.(md|html|htm)$/.test(dataLink)) {
            link.setAttribute('href', `#${filesHeadings[dataLink]?.[0] || `file-${dataLink}`}`);
            link.setAttribute('data-param', dataLink);
          } else {
            let [fileName, fileChapter] = dataLink?.split('#') || [];
            fileName = fileName || currentFile;
            const [, level, order] = fileChapter?.split('-') || [];
            const found = (level && order 
              ? filesHeadings[fileName]?.filter(x => x.startsWith(`h-${level}-`))[+order] 
              : filesHeadings[fileName]?.[0]) || '';
            if (found) {
              link.setAttribute('href', `#${found}`);
              link.setAttribute('data-param', `${fileName}#${found}`);  
            } else {
              // backup for decision about other anchor naming strategies! - pTRAnchorName or general failure process
              link.setAttribute('href', `${fileName}#${fileChapter}`);
              link.setAttribute('data-param', `${fileName}#${fileChapter}`);  
              log('E Link conversion problem:', fileName, link);
            }
          }
        }
      });
      // End: Chapter links recounted to absolute anchors - orders and files if needed
      
      // File anchors are moved to 1st heading of file
      Array.from($A('a.anchor-link[id^="file-"]', evt.parent)).forEach(x => {
        const fileId = x.id.substring(5);
        const firstHeadingId = fileId && filesHeadings[fileId]?.[0];
        const firstHeading = firstHeadingId && $(firstHeadingId);

        if (firstHeading)
          firstHeading.insertBefore(x, firstHeading.firstElementChild);
        else
          x.remove();
        
      });
      // End: File anchors are moved to 1st heading of file


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
