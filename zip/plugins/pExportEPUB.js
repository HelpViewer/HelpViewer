class pExportEPUB extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    const mainDir = 'OEBPS';
    evt.output.file('mimetype', 'application/epub+zip');
    evt.output.file('META-INF/container.xml', this.config['container.xml'] || '');
    const language = getActiveLanguage().toLowerCase();
    const title = getHeader();
    const replacements = {
      'LANG': language,
      'IDENTIFIER': `${configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT)}-${configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT)}`,
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
      evt.output.file(fName, content);
    });

    evt.embeds.values().filter(x => x.endsWith('.svg')).forEach(x => {
      evt.output.remove(x);
      replacements['ADDFILES'].push(`<item id="${x.replaceAll('/', '-').replaceAll('..', 'R.')}" href="${x}" media-type="image/svg+xml"/>`);
    });

    replacements['ADDFILES'] = replacements['ADDFILES'].join('\n');
    evt.output.file(`${mainDir}/package.opf`, opfFile.replace(regex, m => replacements[m.slice(1, -1)]));

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
    
    evt.output.file(`${mainDir}/index.xhtml`, 
      `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html>${new XMLSerializer().serializeToString(doc)}`);
    evt.fileName = evt.fileName.split('.').shift() + '.epub';

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportEPUB);
