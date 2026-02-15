class pTRFlushToMemDOM extends pTRPhasePlugin {
  onETShowChapterResolutions(r) {
    r.result = r.result.then(() => {
      log(`Rendering ${r.uri} data attached to memory DOM - still not visible to user for now`);
      const parser = new DOMParser();
      r.docM = parser.parseFromString(r.content, "text/html");
      r.doc = r.docM;  
    });
  }
}

Plugins.catalogize(pTRFlushToMemDOM);
