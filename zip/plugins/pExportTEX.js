class pExportTEX extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_FILE = 'TPLTex.tex';
  }
  
  onET_GetExportFormat(evt) {
    evt.result.push('TEX');
  }

  async onETPrepareExport(evt) {
    let document = await storageSearch(STO_DATA, this.cfgFILE, STOF_TEXT);
    // TODO : Resolve author name in export
    document = document.replace(/_AUTH_/g, '');
    const header = getHeader();
    document = document.replace(/_DOCNAME_/g, header);

    let dataToFlush = [];
    dataToFlush.push(`\\section\{${header}\}`);
    log('E LIST:', evt.data);

    let i_img = 0;
    let i_svg = 0;
    for (const c of evt.data) {
      let innerText = c.textContent.replace('#', '').trim();
      // TODO: More clever sanitation !!

      switch (c.tagName.toLowerCase()) {
        case 'p':
          dataToFlush.push(`${innerText}\\par`);
          break;
        case 'img':
          i_img++;
          dataToFlush.push(`\\includegraphics[width=1\\textwidth]\{src/img_${i_img}\}`);
          break;
        case 'svg':
          i_svg++;
          dataToFlush.push(`\\includesvg[width=1\\textwidth]\{src/img_${i_svg}.svg\}`);
          break;
        case 'h1':
          dataToFlush.push(`\\section\{${innerText}\}`);
          break;
        case 'h2':
          dataToFlush.push(`\\subsection\{${innerText}\}`);
          break;
        case 'h3':
          dataToFlush.push(`\\subsubsection\{${innerText}\}`);
          break;
        case 'h4':
          dataToFlush.push(`\\paragraph\{${innerText}\}`);
          break;
        case 'h5':
          dataToFlush.push(`\\subparagraph\{${innerText}\}`);
          break;
        case 'h6':
          dataToFlush.push(`\\subsubparagraph\{${innerText}\}`);
          break;
        case 'pre':
          const codeText = this.getPlainCodeFromPrism($O("code", c));
          const prefix = 'language-';
          const langClass = Array.from(c.classList).find(cls => cls.startsWith(prefix));
          const lang = langClass ? langClass.replace(prefix, '') : 'text';
          dataToFlush.push(`\\begin{lstlisting}[language=${lang}, caption={}]\n${codeText}\\end{lstlisting}`);
          break;
        case 'ul':
          break;
        case 'ol':
          break;
  
      }
    }
    
    document = document.replace(/%DOC%/g, dataToFlush.join('\n'));
    dataToFlush = undefined;
    evt.output.file('LaTeX1.tex', document);

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportTEX);
