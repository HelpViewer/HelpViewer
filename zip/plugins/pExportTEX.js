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

    const handlerBold = (node, ctx, children) => `\\textbf\{${children}\}\n`;

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
        return `\\includesvg\{src/svg_${ctx.i_svg}.svg\}\n`;
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

        if (node.classList.contains('page-break'))
          return '\\newpage';

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
      em: (node, ctx, children) => `\\emph\{${children}\}\n`,
      //TODO: Beware of \\end{tabularx} used elsewhere wantedly because of HTML to TeX wrong output.
      table: (node, ctx, children) => `\\begin{table}[H]\n${children}\n \\end{tabularx} \\end{table}\n`,
      thead: (node, ctx, children) => {
        let cols = rowsToArray(children.trim());
        const mCols = 'l|'.repeat(cols.length - 1);
        const mColData = cols.map(c => `\\textbf{${c}}`).join(' & ');
        return `\\begin{tabularx}{\\textwidth}{|${mCols}X|}\n\\hline\n${mColData} \n\\\\ \\hline\n`;
      },

      td: (node, ctx, children) => children,

      tr: (node, ctx, children) => {
        if (node.parentElement.tagName.toLowerCase() === 'thead') return children;
  
        const tds = Array.from(node.children).filter(child => 
          child.tagName.toLowerCase() === 'td' || child.tagName.toLowerCase() === 'th'
        );
        
        const colTexts = tds.map(td => walk(td, ctx));
        return colTexts.join(' & ') + ' \n\\\\ \\hline';
      },

      a: (node, ctx, children) => {
        if (children.trim().replace('\\#', '#').length == 1)
          return '';
        
        let href = node.href || '';
        href = href.replace(/&amp;/g, '&').replace(/&/g, '&amp;');
        href = decodeURI(href);
        href = href
          .replace(/([#\$%&~^{}])/g, '\\$1')
          .replace(/_/g, '\\_');
        
        return `\\href{${href}}{${children}}`;
      },

      script: (node, ctx, children) => '',
      style: (node, ctx, children) => '',

      default: (node, ctx, children) => children
    };

    function escapeLaTeX(text) {
      return text.replace(/([_%&#$\\~^])/g, match => {
        const escapes = {
          '%': '\\%',
          '_': '\\_',
          '#': '\\#',
          '$': '\\$',
          '\\': '\\\\',
          '~': '\\~{}',
          '^': '\\^{}'
        };
        return escapes[match];
      });
    }

    function walk(node, ctx) {
      if (node.nodeType === Node.TEXT_NODE) 
        return escapeLaTeX(node.textContent);
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
    document = document.replace(/_LSTSET_/g, this.config[`${activeLanguage}-lstset`] || '');

    const metainfo = [
      [ `:${_T('helpfile')}`, `:${_T('version')}` ],
      [ configGetDataProjectFile(), configGetValue(CFG_KEY__VERSION) || '' ],
      [ configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT), configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT) ],
      [ _T('source'), dataPath],
      [ _T('date'), getDateInYYYYMMDDHH24IIss(new Date())]
    ];

    const mColData = metainfo.map((x) => [ x[0].startsWith(':') ? `\\textbf{${x[0].substring(1)}}` : x[0], x[1].startsWith(':') ? `\\textbf{${x[1].substring(1)}}` : x[1] ]).map((x) => `${x[0]} & ${x[1]} \\\\`).join(' \\hline\n');

    document = document.replace(/_METAINFO_/g, `\\begin{table}[H]\n\\begin{tabularx}{\\textwidth}{|l|X|}\n\\hline\n${mColData} \\hline\n \\end{tabularx}\\end{table}\n`);

    const ctx = { listStack: [], i_img: 0, i_svg: 0 };
    const latex = `\\section\{${header}\}\n` + walk(evt.parent, ctx);

    document = document.replace(/%DOC%/g, latex);
    evt.output.file('LaTeX1.tex', document);

    if (evt.doneHandler)
      evt.doneHandler();
  }
}

Plugins.catalogize(pExportTEX);
