class pExportRTF extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_FILE = 'TPLRTF.rtf';
    this.RES_HTMLTORTF = new Resource('HTMLTORTF', undefined, STO_DATA, 'TPLRTF.rtf;HTMLToRTF/HTMLToRTF.js;HTMLToRTF/LICENSE;HTMLToRTF/README.md');
  }
  
  async onETPrepareExport(evt) {
    let promise = Promise.resolve(true);

    if (typeof HTMLToRTF !== 'function')
      promise = this.RES_HTMLTORTF?.init(promise);

    promise = promise.then(async() => {

      let source = await storageSearch(STO_DATA, this.cfgFILE, STOF_TEXT);
      const header = getHeader();
      const activeLanguage = getActiveLanguage().toLowerCase();
      const config = this.config;
      const author = configGetDataProjectFile();
      const h1 = document.createElement('h1');
      if (evt.parent.childNodes[0]?.nodeName.toLowerCase() !== 'h1') {
        h1.innerText = header;
        evt.parent.prepend(h1);
      }
    
      const metainfo = [
        [ `:${_T('helpfile')}`, `:${_T('version')}` ],
        [ author, configGetValue(CFG_KEY__VERSION) || '' ],
        [ configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG_DEFAULT), configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT) ],
        [ _T('source'), dataPath],
        [ _T('date'), getDateInYYYYMMDDHH24IIss(new Date())]
      ];

      const ctx = { listStack: [], i_img: 0, i_svg: 0, embeds: evt.embeds };

      const corrections = [];
      sendEvent(EventNames.PreExportCorrection, (x) => {
        x.exportType = this.aliasName;
        x.parent = evt.parent;
        x.temporaryObjects = corrections;
      });

      const converted = HTMLToRTF(evt.parent, header, activeLanguage, config, ctx, source, author);
      corrections.forEach(x => x.remove());
      
      source = converted[0].replace(/%DOC%/g, converted[1]);
      source = source.replace(/_AUTH1_/g, author.split('/').shift());
      evt.output.set('doc.rtf', source);
      this.removeSVG(evt.output);
      h1?.remove();
  
      if (evt.doneHandler)
        evt.doneHandler();

    });

  }
}

Plugins.catalogize(pExportRTF);
