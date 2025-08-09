class pTRFlushToMemDOM extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    r.result = this.doneVal;
    log(`Rendering ${r.uri} data attached to memory DOM - still not visible to user for now`);
    const parser = new DOMParser();
    r.docM = parser.parseFromString(r.content, "text/html");
    r.doc = r.docM;
  }
}

Plugins.catalogize(pTRFlushToMemDOM);
