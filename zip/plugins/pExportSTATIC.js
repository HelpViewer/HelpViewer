class pExportSTATIC extends pExport {
  static EVT_BUTTON_DUMP = 'ButtonDump';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_LAYOUT = 'layoutSTATICExport.htm';
    this.DEFAULT_KEY_CFG_BUTTONORDER = 'printBtn;nav-left;nav-top;nav-right;downP-TopicTree;downP-Glossary;downP-Fulltext;downP-Home';
  }

  init() {
    const T = this.constructor;
    const TI = this;
    conversionToStatic.buttonOrder = TI.cfgBUTTONORDER.split(';');
    TI.catalogizeEventCall(TI.init, T.EVT_BUTTON_DUMP);
    super.init();
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
      const index = x.id.lastIndexOf('.');
      const rightOut = index > -1 ? x.id.slice(0, index) : x.id;
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

    const treeLinksParenting = new Map();
    Array.from($A('a', $('tree'))).map(x => [x.getAttribute('href') || x.getAttribute('data-param'), x])
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

    const styles = this.getStyles();
    const fixesStyle = 'TPL-HTML-fixes.css';
    styles[fixesStyle] = await storageSearch(STO_DATA, fixesStyle, STOF_TEXT);
    styles['_custom.css'] = '';
    const parser = new DOMParser();
    idx = -1;
    const staticData = {};
    staticData.tocExists = filesMap.map(x => x[0]).includes('toc.htm');

    const buttons = new Map();
    sendEvent(T.EVT_BUTTON_DUMP, (x) => {
      x.collected = buttons;
    });

    if (buttons.has('_FILES')) {
      const files = await puiButtonExportResolveImages(buttons.get('_FILES'));
      let imagesListForCSS = [];
      for (const [k, v] of files) {
        evt.output.set(k, v);
        const index = k.lastIndexOf('.')
        const flatName = index > -1 ? k.slice(0, index) : k;
        imagesListForCSS.push(`--icon-${flatName}: url("../${k}");`);
      }

      if (imagesListForCSS && imagesListForCSS.length)
        imagesListForCSS = `\n:root {\n${imagesListForCSS.join('\n')}\n}`;
      else
        imagesListForCSS = '';
      styles[fixesStyle] += imagesListForCSS;
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
      replacements['CONTENT'] = div.innerHTML;
      replacements['DESCRIPTION'] = div.innerText.replace(/[\s#]+/g, ' ').trim().substring(0, 200);
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

    this.removeSVG(evt.output);

    const favicon = await TI.getFavicon(document);
    if (favicon)
      evt.output.set('favicon.png', favicon);

    if (evt.doneHandler)
      evt.doneHandler();
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
    ['downP-TopicTree', (c, id) => c.staticData.tocExists ? conversionToStatic.buttonDefinedVarId(c, 'toc.htm', c.buttonDefinitions.get(id)) : undefined],
    // ['downP-Glossary', (c, id) => {}],
    // ['downP-Fulltext', (c, id) => {}],
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
  }
};
