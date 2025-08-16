class pTRParseMd extends pTRPhasePlugin {
  static KEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    super.init();

    const T = this.constructor;
    this.cfgFileName = this.config[T.KEY_CFG_FILENAME] || 'marked.min.js';
  }

  deInit() {
    $(this.config[this.constructor.KEY_CFG_FILENAME])?.remove();
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    if (!window.marked) {
      const one = this.cfgFileName;
      r.result = storageSearch(STO_DATA, one).then((x) =>
        appendJavaScript(one, x, document.head)
      );
    }

    r.result = (!r.content || r.content.length == 0) ? r.result : r.result.then(() => r.content = marked.parse(r.content));
  }
}

Plugins.catalogize(pTRParseMd);
