class pTRParseMermaid extends pTRPhasePlugin {
  static KEY_CFG_FILENAME = 'FILENAME';

  init() {
    super.init();

    const T = this.constructor;
    this.DEFAULT_KEY_CFG_FILENAME = 'mermaid.min.js;LICENSE-mermaid.md';
    this.cfgFileName = this.config[T.KEY_CFG_FILENAME] || this.DEFAULT_KEY_CFG_FILENAME;
    this.RES_MERMAID = new Resource('MERMAID', undefined, STO_DATA, this.cfgFileName);
  }
  
  onETShowChapterResolutions(r) {
    const loadExtern = () => {
      return this.RES_MERMAID?.init(Promise.resolve());
    }

    r.result = r.result.then(() => {
      const codeBlocks = $A('code.language-mermaid', r.doc);
      if (codeBlocks.length > 0) {
        return loadExtern().then(() => {
          codeBlocks.forEach(code => {
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = code.textContent;
            code.parentElement.replaceWith(div);
          });
          mermaid.initialize({ startOnLoad: false });
          mermaid.init();
        });
      }
    });

  }
}

Plugins.catalogize(pTRParseMermaid);
