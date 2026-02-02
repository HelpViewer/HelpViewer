class pExportSTATIC extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_LAYOUT = 'base/layout.htm';
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    const TI = this;
    const layout = await storageSearch(STO_DATA, TI.cfgLAYOUT, STOF_TEXT);
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = layout;
    const head = doc.head;
    const title = doc.createElement('title');
    const headerTitle = getHeader();
    title.textContent = headerTitle;
    head.appendChild(title);
    
    const div = $O('#content', doc);
    div.innerHTML = evt.parent.innerHTML;

    const divToolbar = document.createElement('div');
    divToolbar.className = "toolbar toolbar-down";
    divToolbar.id = "header-toolbar";
    divToolbar.innerText = '🖨️▶️';
    div.parentElement.appendChild(divToolbar);
    const h1 = document.createElement('h1');
    h1.textContent = headerTitle;
    div.prepend(h1);

    const styles = this.getStyles();
    const fixesStyle = 'TPL-HTML-fixes.css';
    styles[fixesStyle] = await storageSearch(STO_DATA, fixesStyle, STOF_TEXT);
    styles['_custom.css'] = '';

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

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportSTATIC);
