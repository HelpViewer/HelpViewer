class pExportSTATIC extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_LAYOUT = 'layoutSTATICExport.htm';
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    const TI = this;
    const layout = minifyHTMLSource(await storageSearch(STO_DATA, TI.cfgLAYOUT, STOF_TEXT));

    let replacements = {
      'LANG': getActiveLanguage().toLowerCase(),
      'INSTYLE': document.body.className,
      'TITLE': getHeader(),
      'TOOLBAR': '...',//🖨️▶️🖨️▶️
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

    filesMap.forEach(x => {
      const subfolders = '../'.repeat(x[0].split('/').length - 1) || '';
      const div = document.createElement('div');
      div.append(...x[4]);
      div.removeChild(x[4][0]);
      replacements['CONTENT'] = div.innerHTML;
      replacements['DESCRIPTION'] = div.innerText.replace(/[\s#]+/g, ' ').trim().substring(0, 200);
      const title = x[1].childNodes[0]?.nodeType === Node.TEXT_NODE 
        ? x[1].childNodes[0].textContent.trim() 
        : '';
      replacements['TITLE'] = title;
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

    this.removeSVG(evt.output);

    const favicon = await TI.getFavicon(document);
    if (favicon)
      evt.output.set('favicon.png', favicon);

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportSTATIC);
