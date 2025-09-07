class pTRParseMd extends pTRPhasePlugin {
  static KEY_CFG_FILENAME = 'FILENAME';

  init() {
    super.init();

    const T = this.constructor;
    this.DEFAULT_KEY_CFG_FILENAME = 'marked.min.js;LICENSE-marked.md';
    this.cfgFileName = this.config[T.KEY_CFG_FILENAME] || this.DEFAULT_KEY_CFG_FILENAME;
    this.RES_MARKED = new Resource('MARKED', undefined, STO_DATA, this.cfgFileName);
  }
  
  onETShowChapterResolutions(r) {
    if (!window.marked)
      r.result = this.RES_MARKED?.init(r.result);

    r.result = (!r.content || r.content.length == 0) ? r.result : r.result.then(() => r.content = marked.parse(r.content));
  }
}

Plugins.catalogize(pTRParseMd);
