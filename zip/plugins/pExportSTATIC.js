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
    const doc = document.implementation.createHTMLDocument();

    let replacements = {
      'LANG': getActiveLanguage().toLowerCase(),
      'INSTYLE': document.body.className,
      'TITLE': getHeader(),
      'TOOLBAR': '🖨️▶️🖨️▶️',
      'CONTENT' : ''
    };
    replacements['CONTENT'] = evt.parent.innerHTML;
    doc.documentElement.innerHTML = multipleTextReplace(layout, replacements, '_');
    
    // const div = $O('#content', doc);
    // div.innerHTML = evt.parent.innerHTML;

    const styles = this.getStyles();
    const fixesStyle = 'TPL-HTML-fixes.css';
    styles[fixesStyle] = await storageSearch(STO_DATA, fixesStyle, STOF_TEXT);
    styles['_custom.css'] = '';

    const head = doc.head;
    Object.entries(styles).forEach(([filename, content]) => {
      const fName = `src/${filename}`;
      const cssLink = doc.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = fName;
      cssLink.type = 'text/css';
      
      head.appendChild(cssLink);
      evt.output.set(fName, content);
    });

    this.removeSVG(evt.output);
    evt.output.set('index.html', minifyHTMLSource(new XMLSerializer().serializeToString(doc)));

    const favicon = await TI.getFavicon(document);
    if (favicon)
      evt.output.set('favicon.png', favicon);

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportSTATIC);
