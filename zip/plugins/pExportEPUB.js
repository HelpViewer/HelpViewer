class pExportEPUB extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  async onETPrepareExport(evt) {
    if (!evt.parent)
      return;

    evt.mimeType = 'application/epub+zip';
    this.removeSVG(evt.output);
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

    evt.embeds.values().filter(x => x.startsWith('src/') && !x.endsWith('.svg')).forEach(x => {
      const flatName = x.split('/').pop();
      evt.output.set(`${mainDir}/${flatName}`, evt.output.get(x));
      evt.output.delete(x);
      let flatNameMime = flatName.slice(-3);
      flatNameMime = flatNameMime == 'jpg' ? 'jpeg' : flatNameMime;
      replacements['ADDFILES'].push(`<item id="${flatName.replaceAll('/', '-').replaceAll('..', 'R.')}" href="${flatName}" media-type="image/${flatNameMime}"/>`);
    });

    replacements['ADDFILES'] = replacements['ADDFILES'].join('\n');
    evt.output.set(`${mainDir}/package.opf`, multipleTextReplace(opfFile, replacements, '_'));

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

    replacements['TOC'] = '';
    let toc = $O('#tree', div);

    let tocText = undefined;

    if (toc)
      tocText = htmlTreeToLines(toc);
    else {
      tocText = Array.from($A('h1', doc)).map(x => `${x.innerText.endsWith('#') ? x.innerText.slice(0, -1) : x.innerText}|${$O('a', x)?.getAttribute('href') || '#'}`);
      if (tocText.length > 0)
        toc = tocText;
      tocText.push('');
    }

    function _buildTreeFromText(src, handleItem, handleClosing, handleOpening, type = 'ol') {
      let lastLevel = 0;
      let reply = [];
      reply.push(`<${type}>`);
      Array.from(src).forEach((vi) => {
        let level = vi.match(/^ */)[0].length;
        const [title, uri] = vi.trim().split('|');
        if (level < lastLevel)
          handleClosing(type, lastLevel - level, reply);

        if (level > lastLevel)
          handleOpening(type, reply);
        
        if (title && uri)
          reply.push(handleItem(title, uri));
        lastLevel = level;
      });
      reply.push(`</${type}>`);
      return reply;
    }

    let contentsText = this.config['nav.xhtml'] || '';
    const getLocalPath = (u) => u.startsWith('http') ? `index.xhtml#h-1-0` : `index.xhtml${u}`;
    if (toc)
      replacements['TOC'] = _buildTreeFromText(tocText, 
        (t, u) => `<li><a href="${getLocalPath(u)}">${t}</a></li>`,
        (type, difference, reply) => reply.push(`</${type}></li>`.repeat(difference)),
        (type, reply) => {
          reply[reply.length - 1] = reply[reply.length - 1].slice(0, -5);
          reply.push(`<${type}>`);
        }
      ).join('');
    contentsText = multipleTextReplace(contentsText, replacements, '_');
    evt.output.set(`${mainDir}/nav.xhtml`, contentsText);

    contentsText = this.config['toc.ncx'] || '';
    let id = 0;
    if (toc)
      replacements['TOC'] = _buildTreeFromText(tocText, 
        (t, u) => {
          id++;
          return `<navPoint id="nav-${id}" playOrder="${id}"><navLabel><text>${t}</text></navLabel><content src="${getLocalPath(u)}"/></navPoint>`;
        },
        (type, difference, reply) => reply.push(`</navPoint>`.repeat(difference)),
        (type, reply) => {
          reply[reply.length - 1] = reply[reply.length - 1].slice(0, -11);
        },
      'navMap').join('');

    contentsText = multipleTextReplace(contentsText, replacements, '_');
    evt.output.set(`${mainDir}/toc.ncx`, contentsText);
  
    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportEPUB);
