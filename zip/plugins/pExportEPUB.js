class pExportEPUB extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    evt.output.file('mimetype', 'application/epub+zip');
    evt.output.file('META-INF/container.xml', this.config['container.xml'] || '');
    const language = getActiveLanguage().toLowerCase();
    const title = getHeader();
    const replacements = {
      'LANG': language,
      'IDENTIFIER': `${configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT)}-${configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT)}`,
      'TITLE': title,
      'TIME': new Date().toISOString(),
      'ADDFILES': ''
    };
    const regex = new RegExp(`_${Object.keys(replacements).join('_|_')}_`, 'g');
    const opfFile = await storageSearch(STO_DATA, 'TPL-package.opf', STOF_TEXT);
    evt.output.file('OEBPS/package.opf', opfFile.replace(regex, m => replacements[m.slice(1, -1)]));

    const xhtmlNS = 'http://www.w3.org/1999/xhtml';
    const doc = document.implementation.createDocument(xhtmlNS, 'html', null);
    const html = doc.documentElement;
    html.setAttribute('xmlns', xhtmlNS);
    html.setAttribute('xml:lang', language);
    const head = doc.createElementNS(xhtmlNS, 'head');
    const titleT = doc.createElementNS(xhtmlNS, 'title');
    titleT.textContent = title;
    head.appendChild(titleT);
    html.appendChild(head);
    
    const div = document.createElement('div');
    div.className = evt.parent.className;

    div.innerHTML = evt.parent.innerHTML;
    const h1 = document.createElement('h1');
    h1.textContent = title;
    div.prepend(h1);
    log('E TTT', evt.embeds.values().filter(x => x.endsWith('.svg')));
    evt.embeds.values().filter(x => x.endsWith('.svg')).forEach(x => evt.output.remove(x));

    const body = doc.createElementNS(xhtmlNS, 'body');
    html.appendChild(body);
    body.appendChild(div);
    
    evt.output.file('OEBPS/index.xhtml', 
      `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html>${new XMLSerializer().serializeToString(doc)}`);
    evt.fileName = evt.fileName.split('.').shift() + '.epub';

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportEPUB);
