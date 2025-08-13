class pTRParseMermaid extends pTRPhasePlugin {
  static KEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    super.init();

    const T = this.constructor;
    this.cfgFileName = this.config[T.KEY_CFG_FILENAME] || 'mermaid.min.js';
  }

  deInit() {
    $(this.config[this.constructor.KEY_CFG_FILENAME])?.remove();
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    const loadExtern = () => {
      const one = this.cfgFileName;
      return storageSearch(STO_DATA, one).then((x) =>
        appendJavaScript(one, x, document.head)
      );
    }

    r.result = r.result.then(() => {
      const codeBlocks = $A('code.language-mermaid', r.doc);
      if (codeBlocks.length > 0) {
        loadExtern().then(() => {
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
