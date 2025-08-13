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
    log(`Rendering ${r.uri} data attached to DOM - visible to user now`);
    r.fixRelativePathToZipPaths(r.heading, ":not(.treepic)");
    r.setTitle(r.heading);
  
    if (r.docM)
      r.content = r.docM.body.innerHTML;

    r.docV.innerHTML = r.content;
    r.fixRelativePathToZipPaths(r.docV);
    r.doc = r.docV;
  }
}

Plugins.catalogize(pTRFlushToDOM);
