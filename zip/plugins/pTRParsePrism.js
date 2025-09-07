class pTRParsePrism extends pTRPhasePlugin {
  static KEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    super.init();

    const T = this.constructor;
    this.DEFAULT_KEY_CFG_FILENAME = 'prism/prism.js;prism/prism.css;prism/override.css;prism/LICENSE.txt';
    this.cfgFileName = this.config[T.KEY_CFG_FILENAME] || this.DEFAULT_KEY_CFG_FILENAME;
    this.RES_PRISM = new Resource('PRISM', undefined, STO_DATA, this.cfgFileName);
  }
  
  onETShowChapterResolutions(r) {
    const loadExtern = () => {
      return this.RES_PRISM?.init(Promise.resolve());
    }

    //code listings processing
    const codeBlocks = $A('pre code', r.doc);
    if (codeBlocks.length > 0) {
      r.result = r.result.then(() => {
        return loadExtern().then(() => {
          codeBlocks.forEach((block) => {
            block.classList.add('line-numbers');
            Prism.highlightElement(block);
          });
        });
  
      });
    }
  }
}

Plugins.catalogize(pTRParsePrism);
