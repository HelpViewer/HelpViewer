const FILENAME_EXPORT_TOC = 'toc.htm';

class pExportSTATIC extends pExport {
  static EVT_BUTTON_DUMP = 'OfflineDump';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_LAYOUT = 'layoutSTATICExport.htm';
    this.DEFAULT_KEY_CFG_BUTTONORDER = 'printBtn;nav-left;nav-top;nav-right;downP-TopicTree;downP-Glossary;downP-Fulltext;downP-Home';
  }

  init() {
    const T = this.constructor;
    const TI = this;
    conversionToStatic.buttonOrder = TI.cfgBUTTONORDER.split(';');
    super.init();
  }

  clearLastFromRight(x, c = '.') {
    const index = x.lastIndexOf(c);
    const rightOut = index > -1 ? x.slice(0, index) : x;
    return rightOut;
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    const T = this.constructor;
    const TI = this;
    const layout = minifyHTMLSource(await storageSearch(STO_DATA, TI.cfgLAYOUT, STOF_TEXT));

    let replacements = {
      'LANG': getActiveLanguage().toLowerCase(),
      'INSTYLE': document.body.className,
      'TITLE': getHeader(),
      'TOOLBAR': '',
      'CONTENT' : ''
    };

    if (evt.parent.children[0].tagName.toLowerCase() != 'h1') {
      const h1 = document.createElement('h1');
      h1.innerHTML = getHeader();
      const h1a = document.createElement('a');
      h1a.id = 'file-README.htm';
      h1a.className = 'anchor-link';
      h1.append(h1a);
      evt.parent.prepend(h1);
    }

    const allHref = Array.from($A('a', evt.parent));
    const allAnchor = allHref.filter(x => x.className == 'anchor-link');
    const filesList = allAnchor.filter(x => x.id?.startsWith('file-'));
    filesList.forEach(x => {
      const rightOut = TI.clearLastFromRight(x.id, '.');
      x.id = rightOut + '.htm';
    });
    const filesMap = filesList.map(x => [x.id.substring(5), x.parentElement, [], undefined, []]);
    const headingToFileMap = new Map();

    let lastFileOrder = -1;
    let lastFileName = '';
    allAnchor.reduce((map, item) => {
      if (item.id?.startsWith('file-')) {
        lastFileName = item.id.substring(5);
        lastFileOrder++;
      } else {
        const idName = item.getAttribute('href');//.substring(1);
        filesMap[lastFileOrder][2].push(idName);
        filesMap[lastFileOrder][3] = item.parentElement;
        headingToFileMap.set(idName, lastFileName);
      }
      return map;
    }, {});

    allHref.filter(x => !x.classList?.length && x.getAttribute('href')?.startsWith('#')).forEach(x => {
      const dataParam = x.getAttribute('data-param')?.replace('.md', '.htm') || '';
      const index = dataParam.indexOf('#');
      const target = index > 0 ? dataParam.slice(0, index) : dataParam;
      x.href = `${target}${x.getAttribute('href')}`;
    });

    const staticData = {};
    staticData.tocExists = filesMap.map(x => x[0]).includes(FILENAME_EXPORT_TOC);
    staticData.indexes = [];

    const treeLinksParenting = new Map();
    let treeObject = $('tree');
    let treeData = Array.from($A('a', treeObject));
    const dynamicTOCNeed = !treeObject || !treeData.length && filesMap.length > 1
    if (dynamicTOCNeed) {
      const rows = filesMap.map(x => {
        const titleL = x[1].childNodes[0]?.nodeValue;
        return `${titleL}|${titleL}||${x[0]}`;
      });

      treeObject = document.createElement('ul');
      treeObject.innerHTML = linesToHtmlTree(rows.join('\n'));
      treeData = Array.from($A('a', treeObject));
      treeData.forEach(x => x.setAttribute('href', x.getAttribute('data-param')));
    }

    treeData.forEach(x => x.insertAdjacentHTML('afterend', ' '));

    treeData.map(x => [x.getAttribute('href') || x.getAttribute('data-param'), x])
    .map(x => [x[0], x[1].parentElement?.parentElement?.parentElement?.firstElementChild?.firstElementChild
      ?.getAttribute('href') || ''])
    .forEach(x => {
      let idx = x[0].indexOf('#');
      x[0] = idx === -1 ? x[0] : x[0].substring(0, idx);
      idx = x[1].indexOf('#');
      x[1] = idx === -1 ? x[1] : x[1].substring(0, idx);
      treeLinksParenting.set(x[0], x[1]);
    });

    let lastH = null;
    let idx = -1;
    Array.from(evt.parent.children)
    //querySelectorAll('*')
    .forEach(el => {
      if (el.tagName.toLowerCase() == 'h1' && lastH !== headingToFileMap[el.getAttribute('href')]) {
        idx++;
        lastH = el;
      }
      filesMap[idx][4].push(el);
    });

    if (dynamicTOCNeed) {
      const h1 = document.createElement('h1');
      h1.innerText = _T('downP-TopicTree');
      const dynamicToc = [FILENAME_EXPORT_TOC, h1, [], h1, [h1, treeObject]];
      filesMap.splice(1, 0, dynamicToc);
      staticData.tocExists = filesMap.map(x => x[0]).includes(FILENAME_EXPORT_TOC);
    }

    const styles = this.getStyles();
    const fixesStyle = 'TPL-HTML-fixes.css';
    styles[fixesStyle] = await storageSearch(STO_DATA, fixesStyle, STOF_TEXT);
    styles['_custom.css'] = '';
    const parser = new DOMParser();
    idx = -1;

    const buttons = new Map();
    sendEvent(T.EVT_BUTTON_DUMP, (x) => {
      x.collected = buttons;
    });

    if (buttons.has('_FILES')) {
      const files = await puiButtonExportResolveImages(buttons.get('_FILES'));
      let imagesListForCSS = [];
      for (const [k, v] of files) {
        evt.output.set(k, v);
        const flatName = TI.clearLastFromRight(k, '.');
        imagesListForCSS.push(`--icon-${flatName}: url("../${k}");`);
      }

      if (imagesListForCSS && imagesListForCSS.length)
        imagesListForCSS = `\n:root {\n${imagesListForCSS.join('\n')}\n}`;
      else
        imagesListForCSS = '';
      styles[fixesStyle] += imagesListForCSS;
    }

    if (getUserConfigValue(KEY_LS_EXPORTDICT) == 1) {
      Array.from(buttons.keys()).filter(x => x.startsWith('_INDEX_')).forEach(d => {
        const dictionary = buttons.get(d);
        const alias = d.substring(7);
        staticData.indexes.push(alias);
        TI.processIndexFile(filesMap, alias, dictionary);
      });  
    }

    filesMap.forEach(x => {
      idx++;
      const subfolders = '../'.repeat(x[0].split('/').length - 1) || '';
      const context = new StaticExportFileContext();
      context.subfolders = subfolders;
      context.currentPagePath = x[0];
      context.nparent = treeLinksParenting.get(x[0]) || '';
      context.nnext = filesMap[idx+1]?.[0] || '';
      context.nprevious = filesMap[idx-1]?.[0] || '';
      context.staticData = staticData;
      context.buttonDefinitions = buttons;

      const div = document.createElement('div');
      div.append(...x[4]);
      div.removeChild(x[4][0]);
      if (subfolders)
        Array.from($A('a:not([class])', div)).filter(a => !/^(ftp|https|\?|#|@|:)/.test(a.getAttribute('href'))).forEach(a => a.setAttribute('href', `${subfolders}${a.getAttribute('href')}`));
      replacements['CONTENT'] = div.innerHTML;
      replacements['DESCRIPTION'] = div.innerText.replace(/[\s#]+/g, ' ').trim().substring(0, 160);
      const title = x[1].childNodes[0]?.nodeType === Node.TEXT_NODE 
        ? x[1].childNodes[0].textContent.trim() 
        : '';
      replacements['TITLE'] = title;

      conversionToStatic.buttonOrder.forEach(x => context.panelButtons.push(conversionToStatic.buttons.get(x)?.(context, x)));
      replacements['TOOLBAR'] = context.panelButtons.filter(x => x).map(x => x.outerHTML).join('');

      const populated = multipleTextReplace(layout, replacements, '_');

      const doc = parser.parseFromString(populated, "text/html");
      const head = doc.head;
      const faviconRel = $O("link[rel~='icon']", head);
      faviconRel.href = `${subfolders}${faviconRel.getAttribute('href')}`;
      Object.entries(styles).forEach(([filename, content]) => {
        const fName = `src/${filename}`;
        const cssLink = doc.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = `${subfolders}${fName}`;
        cssLink.type = 'text/css';
        
        head.appendChild(cssLink);
        evt.output.set(fName, content);
      });

      evt.output.set(x[0], minifyHTMLSource(doc.documentElement.outerHTML));
    });

    evt.output.set('index.htm', minifyHTMLSource(evt.output.get('README.htm')));

    let sitemapText = await storageSearch(STO_DATA, FILENAME_SITEMAPTPL, STOF_TEXT);
    const date = new Date().toISOString();
    sitemapText = sitemapText.replace('_SITES_', filesMap.filter(x => !x[0].startsWith('http')).map(x => `<url><loc>_REMOTEHOST_${x[0]}</loc><lastmod>${date}</lastmod></url>`).join('\n'));
    evt.output.set('sitemap.xml', sitemapText);

    evt.output.set('robots.txt', 
`User-agent: *
Allow: /
Disallow: /src/
Sitemap: _REMOTEHOST_/sitemap.xml
`);
    
    this.removeSVG(evt.output);

    const favicon = await TI.getFavicon(document);
    if (favicon)
      evt.output.set('favicon.png', favicon);

    if (evt.doneHandler)
      evt.doneHandler();
  }

  processIndexFile(filesMap, alias, dictionary) {
    const printList = (dict, parseItem) => {
      let i = 0;
      return `<ul class="tree" id="${alias}" role="tree">${dict.map(xa => {
      i++;
      const [x, xt, path] = parseItem(xa);
      return `<li role="treeitem"><a href="${path}${x}.htm" id="${alias}|${i}" data-param="@${x}:${alias}" title="${xt}" aria-label="${xt}" class="k">${xt}</a> </li>`
    }).join('')}</ul>`
    };

    //index.htm
    const h1t = document.createElement('h1');
    const buttonName = conversionToStatic.convertIndexId(alias);
    h1t.innerText = _T(buttonName);
    const indexFile = [`${alias}/index.htm`, h1t, [], h1t, []];
    const indexFileContent = printList(dictionary.get("WORD"), (x) => [x, x, 'w/']);

    const divt = document.createElement('div');
    divt.innerHTML = indexFileContent;
    indexFile[4].push(h1t, ...divt.children);
    filesMap.push(indexFile);
    dictionary.get("FILE-TITLE-WORD").forEach(t => t[0][0] = this.clearLastFromRight(t[0][0], '.'));

    Promise.all(Array.from(dictionary.get("WORD-FILE"), xa => {
      const h1 = document.createElement('h1');
      h1.innerText = xa[0];
      const oneFile = [`${alias}/w/${xa[0]}.htm`, h1, [], h1, []];
      const oneConnectionTable = xa[1].map(x => dictionary.get("FILE-TITLE-WORD")[x][0]);
      const content = printList(oneConnectionTable, (x) => [x[0], x[1], '../../']);
      const div = document.createElement('div');
      div.innerHTML = content;
      oneFile[4].push(h1, ...div.children);
      filesMap.push(oneFile);
    }));

  }
}

Plugins.catalogize(pExportSTATIC);

class StaticExportFileContext {
  constructor() {
    this.subfolders = '';

    this.nprevious = '';
    this.nparent = '';
    this.nnext = '';

    this.homePath = 'index.htm';
    this.currentPagePath = '';
    this.panelButtons = [];
    this.staticData = {};
    this.buttonDefinitions = new Map();
  }
}

const conversionToStatic = {
  pages: [],
  buttonOrder: '',
  buttons: new Map([
    ['printBtn', (c, id) => {
      if (!c.staticData.printcmd) {
        c.staticData.printcmd = conversionToStatic.buttonBuilder(c.buttonDefinitions.get(id));
        c.staticData.printcmd.setAttribute('href', 'javascript:window.print();');
      }
      return c.staticData.printcmd;
    }],
    ['nav-left', (c, id) => conversionToStatic.buttonDefinedVarId(c, c.nprevious, c.buttonDefinitions.get(id))],
    ['nav-top', (c, id) => conversionToStatic.buttonDefinedVarId(c, c.nparent, c.buttonDefinitions.get(id))],
    ['nav-right', (c, id) => conversionToStatic.buttonDefinedVarId(c, c.nnext, c.buttonDefinitions.get(id))],
    ['downP-TopicTree', (c, id) => c.staticData.tocExists ? conversionToStatic.buttonDefinedVarId(c, FILENAME_EXPORT_TOC, c.buttonDefinitions.get(id)) : undefined],
    ['downP-Glossary', (c, id) => conversionToStatic.buttonIndexFile(c, c.staticData?.indexes?.includes('keywordList') ? 'keywordList' : undefined , c.buttonDefinitions.get(id))],
    ['downP-Fulltext', (c, id) => conversionToStatic.buttonIndexFile(c, c.staticData?.indexes?.includes('fulltextList') ? 'fulltextList' : undefined, c.buttonDefinitions.get(id))],
    ['downP-Home', (c, id) => conversionToStatic.buttonDefinedVarId(c, 'index.htm', c.buttonDefinitions.get(id))],
  ]),
  buttonBuilder: (btnDef) => {
    if (!btnDef)
      return undefined;

    const button = document.createElement('a');
    button.id = btnDef.buttonId;
    button.innerText = btnDef.caption;
    button.title = btnDef.title;
    button.setAttribute('aria-label', btnDef.aria);
    return button;
  },
  buttonDefinedVarId: (c, v, id) => {
    if (v) {
      if (v.startsWith(':'))
        v = '_' + v.slice(1);
      const b = conversionToStatic.buttonBuilder(id);
      b.setAttribute('href', `${c.subfolders}${v}`);
      return b;
    }
  },
  buttonIndexFile: (c, v, id) => {
    if (v) {
      const b = conversionToStatic.buttonBuilder(id);
      b.setAttribute('href', `${c.subfolders}${v}/index.htm`);
      return b;
    }
  },
  IndexNameToButtonId: [
    'keywordList', 'downP-Glossary', 
    'fulltextList', 'downP-Fulltext',
  ],
  convertIndexId: (id) => {
    const index = conversionToStatic.IndexNameToButtonId.indexOf(id);
    if (index === -1)
      return undefined;

    if (index % 2 === 0)
      return conversionToStatic.IndexNameToButtonId[index + 1];
    else
      return conversionToStatic.IndexNameToButtonId[index - 1];
  }
};
