class pTRParseMd extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_FILENAME = 'marked.min.js;LICENSE-marked.md';
  }

  init() {
    super.init();
    this.RES_MARKED = new Resource('MARKED', undefined, STO_DATA, this.cfgFILENAME);
  }
  
  onETShowChapterResolutions(r) {
    if (!window.marked)
      r.result = this.RES_MARKED?.init(r.result);

    r.result = (!r.content || r.content.length == 0) ? r.result : r.result.then(() => r.content = marked.parse(r.content));
  }
}

Plugins.catalogize(pTRParseMd);
