class pExportEPUB extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    const mainDir = 'OEBPS';
    evt.output.set('mimetype', 'application/epub+zip');
    evt.output.set('META-INF/container.xml', this.config['container.xml'] || '');
    const language = getActiveLanguage().toLowerCase();
    const title = getHeader();
    const replacements = {
      'LANG': language,
      'IDENTIFIER': `${configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG)}-${configGetValue(CFG_KEY__VERSION)}`,
      'TITLE': title,
      'TIME': new Date().toISOString(),
      'ADDFILES': []
    };
    const regex = new RegExp(`_${Object.keys(replacements).join('_|_')}_`, 'g');
    const opfFile = await storageSearch(STO_DATA, 'TPL-package.opf', STOF_TEXT);

    const xhtmlNS = 'http://www.w3.org/1999/xhtml';
    const doc = document.implementation.createDocument(xhtmlNS, 'html', null);
    const html = doc.documentElement;
    const head = doc.createElementNS(xhtmlNS, 'head');

    const styles = this.getStyles();
    Object.entries(styles).forEach(([filename, content]) => {
      const fName = `${mainDir}/${filename}`;
      const cssLink = doc.createElementNS(xhtmlNS, 'link');
      cssLink.setAttribute('rel', 'stylesheet');
      const relToChapter = filename;
      cssLink.setAttribute('href', relToChapter);
      replacements['ADDFILES'].push(`<item id="${fName.replaceAll('/', '-')}" href="${relToChapter}" media-type="text/css"/>`);
      cssLink.setAttribute('type', 'text/css');
      
      head.appendChild(cssLink);
      evt.output.set(fName, content);
    });

    evt.embeds.values().filter(x => x.startsWith('src/')).forEach(x => {
      const flatName = x.split('/').pop();
      evt.output.set(`${mainDir}/${flatName}`, evt.output.get(x));
      evt.output.delete(x);
      replacements['ADDFILES'].push(`<item id="${flatName.replaceAll('/', '-').replaceAll('..', 'R.')}" href="${flatName}" media-type="image/svg+xml"/>`);
    });

    replacements['ADDFILES'] = replacements['ADDFILES'].join('\n');
    evt.output.set(`${mainDir}/package.opf`, opfFile.replace(regex, m => replacements[m.slice(1, -1)]));

    html.setAttribute('xmlns', xhtmlNS);
    html.setAttribute('xml:lang', language);
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

    const body = doc.createElementNS(xhtmlNS, 'body');
    html.appendChild(body);
    body.appendChild(div);
    Array.from($A('a.anchor-link', doc)).forEach(x => x.innerText = '');
    
    evt.output.set(`${mainDir}/index.xhtml`, 
      `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html>${new XMLSerializer().serializeToString(doc)}`);
    evt.fileName = evt.fileName.split('.').shift() + '.epub';

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportEPUB);
