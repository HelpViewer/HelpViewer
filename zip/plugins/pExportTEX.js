class pExportTEX extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_FILE = 'TPLTex.tex';
    this.RES_HTMLTOTEX = new Resource('HTMLTOTEX', undefined, STO_DATA, 'TPLTex.tex;HTMLToTeX/HTMLToTeX.js;HTMLToTeX/LICENSE;HTMLToTeX/README.md');
  }
  
  async onETPrepareExport(evt) {
    let promise = Promise.resolve(true);

    if (typeof HTMLToTeX !== 'function')
      promise = this.RES_HTMLTOTEX?.init(promise);

    promise = promise.then(async() => {

      let document = await storageSearch(STO_DATA, this.cfgFILE, STOF_TEXT);
      const header = getHeader();
      const activeLanguage = getActiveLanguage().toLowerCase();
      const config = this.config;
      const author = configGetDataProjectFile();
    
      const metainfo = [
        [ `:${_T('helpfile')}`, `:${_T('version')}` ],
        [ author, configGetValue(CFG_KEY__VERSION) || '' ],
        [ configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT), configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT) ],
        [ _T('source'), dataPath],
        [ _T('date'), getDateInYYYYMMDDHH24IIss(new Date())]
      ];
  
      const mColData = metainfo.map((x) => [ x[0].startsWith(':') ? `\\textbf{${x[0].substring(1)}}` : x[0], x[1].startsWith(':') ? `\\textbf{${x[1].substring(1)}}` : x[1] ]).map((x) => `${x[0]} & ${x[1]} \\\\`).join(' \\hline\n');
  
      document = document.replace(/_METAINFO_/g, `\\begin{table}[H]\n\\begin{tabularx}{\\textwidth}{|l|X|}\n\\hline\n${mColData} \\hline\n \\end{tabularx}\\end{table}\n`);
  
      const ctx = { listStack: [], i_img: 0, i_svg: 0, embeds: evt.embeds };
      const converted = HTMLToTeX(evt.parent, header, activeLanguage, config, ctx, document, author);
      const latex = `\\section\{${header}\}\n` + converted[1];
      document = converted[0].replace(/%DOC%/g, latex);
      evt.output.set('LaTeX1.tex', document);
  
      if (evt.doneHandler)
        evt.doneHandler();

    });

  }
}

Plugins.catalogize(pExportTEX);
