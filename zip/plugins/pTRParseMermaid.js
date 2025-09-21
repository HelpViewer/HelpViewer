class pTRParseMermaid extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_FILENAME = 'mermaid.min.js;LICENSE-mermaid.md';
  }

  init() {
    super.init();
    this.RES_MERMAID = new Resource('MERMAID', undefined, STO_DATA, this.cfgFILENAME);
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
