class pExportHTM extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    const doc = document.implementation.createHTMLDocument();
    const head = doc.head;
    const title = doc.createElement('title');
    const headerTitle = getHeader();
    title.textContent = headerTitle;
    head.appendChild(title);
    
    const div = document.createElement('div');
    div.innerHTML = evt.parent.innerHTML;
    const h1 = document.createElement('h1');
    h1.textContent = headerTitle;
    div.prepend(h1);
    div.className = evt.parent.className;

    doc.body.appendChild(div);

    const styles = this.getStyles();
    Object.entries(styles).forEach(([filename, content]) => {
      const fName = `src/${filename}`;
      const cssLink = doc.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = fName;
      cssLink.type = 'text/css';
      
      head.appendChild(cssLink);
      evt.output.set(fName, content);
    });

    evt.output.set('index.html', new XMLSerializer().serializeToString(doc));

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportHTM);
