class pTRParsePrism extends pTRPhasePlugin {
  static KEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    super.init();

    const T = this.constructor;
    this.cfgFileName = this.config[T.KEY_CFG_FILENAME] || 'prism/prism.js';
  }

  deInit() {
    $(this.config[this.constructor.KEY_CFG_FILENAME])?.remove();
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    r.result = this.doneVal;

    const loadExtern = () => {
      const one = this.cfgFileName;
      return storageSearch(STO_DATA, one).then((x) =>
        appendJavaScript(one, x, document.head)
      );
    }

    //code listings processing
    r.result = r.result.then(() => {
    });

    const codeBlocks = $A('pre code', r.doc);
    if (codeBlocks.length > 0) {
      loadExtern().then(() => {
        codeBlocks.forEach((block) => {
          block.classList.add('line-numbers');
          Prism.highlightElement(block);
        });    
      });
    }

  }
}

Plugins.catalogize(pTRParsePrism);
