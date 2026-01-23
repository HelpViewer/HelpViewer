class pExportTEX extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_FILE = 'TPLTex.tex';
  }
  
  onET_GetExportFormat(evt) {
    evt.result.push('TEX');
  }

  async onETPrepareExport(evt) {
    function clearHash(text) {
      let cleanedText = text;
      if (text.endsWith('#'))
        cleanedText = text.substring(0, text.length - 1);
      return cleanedText.trim();
    }

    const handlerBold = (node, ctx, children) => `\\textbf\{${sCh(children)}\}\n`;

    const handlers = {
      ul: (node, ctx, children) => {
        ctx.listStack.push('itemize');
        const body = children;
        ctx.listStack.pop();
        return `\\begin{itemize}\n${body}\\end{itemize}\n`;
      },
      ol: (node, ctx, children) => {
        ctx.listStack.push('enumerate');
        const body = children;
        ctx.listStack.pop();
        return `\\begin{enumerate}\n${body}\\end{enumerate}\n`;
      },
      li: (node, ctx, children) => {
        return `\\item ${children}\n`;
      },
      img: (node, ctx, children) => {
        ctx.i_img++;
        //return `\\includegraphics[width=1\\textwidth]\{src/img_${ctx.i_img}\}\n`;
        return `\\begin{figure}\n\\includegraphics\{src/img_${ctx.i_img}\}\n\\caption{${node.title}}\n\\label{fig:I_${ctx.i_img}}\n\\end{figure}\n`;
      },
      svg: (node, ctx, children) => {
        ctx.i_svg++;
        return `\\includesvg\{src/img_${ctx.i_svg}.svg\}\n`;
      },
      h1: (node, ctx, children) => `\\section\{${clearHash(children)}\}\n`,
      h2: (node, ctx, children) => `\\subsection\{${clearHash(children)}\}\n`,
      h3: (node, ctx, children) => `\\subsubsection\{${clearHash(children)}\}\n`,
      h4: (node, ctx, children) => `\\paragraph\{${clearHash(children)}\}\n`,
      h5: (node, ctx, children) => `\\subparagraph\{${clearHash(children)}\}\n`,
      h6: (node, ctx, children) => `\\subsubparagraph\{${clearHash(children)}\}\n`,
      p: (node, ctx, children) => `${children}\\par\n`,

      div: (node, ctx, children) => {
        if (node.classList.contains('toolbar-item') || node.classList.contains('toolbar'))
          return '';
        return children;
      },

      code: (node, ctx, children) => {
        if (node.classList.length == 0)
          return children;

        const codeText = node.textContent;
        const prefix = 'language-';
        const langClass = Array.from(node.classList).find(cls => cls.startsWith(prefix));
        let lang = langClass ? langClass.replace(prefix, '') : '{}';
        lang = lang == 'none' ? '{}' : lang;

        return `\\begin{lstlisting}[language=${lang}, caption={}]\n${codeText}\\end{lstlisting}`;
      },

      strong: handlerBold,
      b: handlerBold,
      em: (node, ctx, children) => `\\emph\{${sCh(children)}\}\n`,
      table: (node, ctx, children) => `\begin{table}[h]\n{${sCh(children)}\n\end{table}\n`,

      a: (node, ctx, children) => {
        if (children.trim().length == 1)
          return '';
        return `\\href{${node.href}}{${sCh(children)}}`;
      },

      script: (node, ctx, children) => '',
      style: (node, ctx, children) => '',

      default: (node, ctx, children) => sCh(children)
    };

    function sCh(children) {
      log('E TT:', [children, children.parentElement]);
      return children.replace('_', '\_');
    }

    function walk(node, ctx) {
      if (node.nodeType === Node.TEXT_NODE) 
        return node.textContent;
      const children = Array.from(node.childNodes)
        .map(child => walk(child, ctx))
        .join('');
      const tag = node.nodeName.toLowerCase();
      const handler = handlers[tag] || handlers.default;
      return handler(node, ctx, children);
    }

    let document = await storageSearch(STO_DATA, this.cfgFILE, STOF_TEXT);
    // TODO : Resolve author name in export
    document = document.replace(/_AUTH_/g, '');
    const header = getHeader();
    document = document.replace(/_DOCNAME_/g, header);
    const activeLanguage = getActiveLanguage().toLowerCase();
    document = document.replace(/_LANG_/g, this.config[activeLanguage] || activeLanguage);

    const ctx = { listStack: [], i_img: 0, i_svg: 0 };
    const latex = `\\section\{${header}\}\n` + walk(evt.parent, ctx);

    document = document.replace(/%DOC%/g, latex);
    evt.output.file('LaTeX1.tex', document);

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportTEX);
