class pTRParsePrism extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_FILENAME = 'prism/prism.js;prism/prism.css;prism/override.css;prism/LICENSE.txt';
  }

  init() {
    super.init();
    this.RES_PRISM = new Resource('PRISM', undefined, STO_DATA, this.cfgFILENAME);
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
            if (!block.classList.contains('language-treeview'))
              block.classList.add('line-numbers');
            Prism.highlightElement(block);
          });
        });
  
      });
    }
  }
}

Plugins.catalogize(pTRParsePrism);
