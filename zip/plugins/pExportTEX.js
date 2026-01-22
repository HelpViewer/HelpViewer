class pExportTEX extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_FILE = 'TPLTex.tex';
  }
  
  onET_GetExportFormat(evt) {
    evt.result.push('TEX');
  }

  async onETPrepareExport(evt) {
    searchOverTextNodesAndDo(evt.parent, (x) => log('E TEXT NODE:', x.parentElement.nodeName, x));
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
    let parNode = evt.parent;
    let codePre = undefined;
    let liType = undefined;
    let olulObject = undefined;

    searchOverTextNodesAndDo(evt.parent, (x) => {
      if (parNode != x.parentElement) {
        parNode = x.parentElement;
      }

      if (codePre) {
        if (codePre == x.parentElement)
          codePre = undefined;
        else 
          return;
      }

      //codePre = false;
      log('E RR0 ', x.parentElement);
      log('E RR ', [x, x.nodeName, x.parentElement.nodeName]);
      const innerText = x.textContent;

      if (liType && x.parentElement.nodeName.toLowerCase() != 'li') {
        dataToFlush.push(`\\end{${liType}}`);
        liType = undefined;
        olulObject = undefined;
      }

      switch (x.parentElement.nodeName.toLowerCase()) {
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
        case 'div':
          log('E DIV FOUND', x, x.nextElementSibling);
          x = x.nextElementSibling;
          if (Array.from(x.classList).find(cls => cls.startsWith('code-toolbar'))) {
            codePre = x.nextElementSibling;
            log('E GG', codePre);
            const codeText = this.getPlainCodeFromPrism($O("code", x.childNodes[0]));
            const prefix = 'language-';
            const langClass = Array.from(x.classList).find(cls => cls.startsWith(prefix));
            const lang = langClass ? langClass.replace(prefix, '') : 'text';
            dataToFlush.push(`\\begin{lstlisting}[language=${lang}, caption={}]\n${codeText}\\end{lstlisting}`);
          }
          break;
        case 'pre':
          if (!codePre)
            dataToFlush.push(`\\texttt{${innerText}}`);
          break;
        case 'a':
          if (innerText.trim().length == 1)
            break;
          dataToFlush.push(`\\href{${x.parentElement.href}}{${innerText}}`);
          break;
        case 'ul':
          if (olulObject)
            break;
          dataToFlush.push('\\begin{itemize}');
          liType = 'itemize';
          olulObject = x.parentElement;
          break;
        case 'ol':
          if (olulObject)
            break;
          dataToFlush.push('\\begin{enumerate}');
          liType = 'enumerate';
          olulObject = x.parentElement;
          break;
        case 'strong':
          dataToFlush.push(`\\textbf{${innerText}}`);
          break;
        case 'em':
          dataToFlush.push(`\\emph{${innerText}}`);
          break;
        case 'li':
          dataToFlush.push('\\item ');
        default:
          if (codePre)
            break;

          dataToFlush.push(`--L${innerText}L--`);
          break;
      }
    });
    // for (const c of evt.data) {
    //   let innerText = c.textContent.replace('#', '').trim();
    //   // TODO: More clever sanitation !!


    // }
    
    document = document.replace(/%DOC%/g, dataToFlush.join('\n'));
    dataToFlush = undefined;
    evt.output.file('LaTeX1.tex', document);

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportTEX);
