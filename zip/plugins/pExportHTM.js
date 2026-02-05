class pExportHTM extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    const doc = document.implementation.createHTMLDocument();
    const head = doc.head;
    const title = doc.createElement('title');
    const headerTitle = getHeader();
    title.textContent = headerTitle;
    head.appendChild(title);
    
    const div0 = document.createElement('div');
    div0.className = evt.parent.parentElement.className;
    const div = document.createElement('div');
    div.innerHTML = evt.parent.innerHTML;
    const h1 = document.createElement('h1');
    h1.textContent = headerTitle;
    div.prepend(h1);
    div.className = evt.parent.className;

    div0.appendChild(div);
    doc.body.appendChild(div0);

    const styles = this.getStyles();
    const fixesStyle = 'TPL-HTML-fixes.css';
    styles[fixesStyle] = await storageSearch(STO_DATA, fixesStyle, STOF_TEXT);
    styles['custom.css'] = '';

    Object.entries(styles).forEach(([filename, content]) => {
      const fName = `src/${filename}`;
      const cssLink = doc.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = fName;
      cssLink.type = 'text/css';
      
      head.appendChild(cssLink);
      evt.output.set(fName, content);
    });

    let sitemapText = await storageSearch(STO_DATA, FILENAME_SITEMAPTPL, STOF_TEXT);
    sitemapText = sitemapText.replace('_SITES_', `<url><loc>_REMOTEHOST_${FILENAME_INDEXHTM}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`);
    evt.output.set('sitemap.xml', sitemapText);

    evt.output.set('robots.txt', 
`User-agent: *
Disallow: /
Allow: /${FILENAME_INDEXHTM}
Sitemap: _REMOTEHOST_/sitemap.xml
`);

    this.removeSVG(evt.output);
    evt.output.set(FILENAME_INDEXHTM, minifyHTMLSource(new XMLSerializer().serializeToString(doc)));

    const favicon = await this.getFavicon(document);
    if (favicon)
      evt.output.set('favicon.png', favicon);

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportHTM);
