class pExportMD extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.RES_HTMLTOMD = new Resource('HTMLTOMD', undefined, STO_DATA, 'HTMLToMD/HTMLToMD.js;HTMLToMD/LICENSE;HTMLToMD/README.md');
  }

  onET_GetExportFormat(evt) {
    evt.result.push('MD');
  }

  onETPrepareExport(evt) {
    let promise = Promise.resolve(true);

    if (typeof HTMLToTeX !== 'function')
      promise = this.RES_HTMLTOMD?.init(promise);

    promise = promise.then(async() => {
      const ctx = { listStack: [], i_img: 0, i_svg: 0, embeds: evt.embeds };
      const header = getHeader();
      const tocTree = $('tree');

      let tocData0 = tocTree?.innerHTML || ''; 
      let tocData = tocTree?.innerHTML || '';

      if (tocTree) {
        tocTree.innerHTML = '%%TOC%%'
        const ctx = { listStack: [], i_img: 0, i_svg: 0, embeds: evt.embeds };
        const tmpContainer = document.createElement('div');
        tmpContainer.innerHTML = tocData;
        tocData = HTMLToMD(tmpContainer, ctx).replaceAll(')- [', ')\n- [');
      }
      
      let converted = `# ${header}\n\n` + HTMLToMD(evt.parent, ctx);

      if (tocTree) {
        tocTree.innerHTML = tocData0;
        converted = converted.replace('%%TOC%%', tocData);
      }

      evt.output.file('README.md', converted);
  
      if (evt.doneHandler)
        evt.doneHandler();

    });

  }
}

Plugins.catalogize(pExportMD);
