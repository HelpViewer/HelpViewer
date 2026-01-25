class pExportHTM extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  async init() {
    super.init();

    const TI = this;
  }

  deInit() {
    super.deInit();
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

    doc.body.appendChild(div);

    evt.output.file('index.html', new XMLSerializer().serializeToString(doc));

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportHTM);
