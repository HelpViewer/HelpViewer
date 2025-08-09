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
    if (r.docM)
      r.doc.innerHTML = r.docM.body.innerHTML;
    else
      r.doc.innerHTML = r.content;
  }
}

Plugins.catalogize(pTRFlushToDOM);
