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
    
    Object.entries(styles).forEach(([filename, content]) => {
      const fName = `src/${filename}`;
      const cssLink = doc.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = fName;
      cssLink.type = 'text/css';
      
      head.appendChild(cssLink);
      evt.output.set(fName, content);
    });

    evt.output.set('index.html', minifyHTMLSource(new XMLSerializer().serializeToString(doc)));

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportHTM);

function minifyHTMLSource(html) {
  const blocks = [];
  html = html.replace(/<(pre|script|style|textarea)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, content) => {
      const id = 'BLOCK' + blocks.length;
      blocks.push(`<${tag}>${content}</${tag}>`);
      return `<${id}>`;
  });
  
  html = html.replace(/>\s+</g, '><');
  return html.replace(/<BLOCK(\d+)>/g, (m, i) => blocks[i]);
}
