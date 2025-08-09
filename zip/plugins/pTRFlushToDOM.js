class pTRFlushToDOM extends pTRPhasePlugin {
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
    log(`Rendering ${r.uri} data attached to DOM - visible to user now`);
    r.setTitle(r.heading);
    r.doc.innerHTML = r.content;
  }
}

Plugins.catalogize(pTRFlushToDOM);
