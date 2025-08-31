class pKWIndexDoc extends pTRPhasePlugin {
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
    r.result = r.result.then((x) => {
      r.content = r.content?.trim() || '';
      r.content = textCleanupPhrase(r.content).replace(/[^a-z0-9\s]/g, " ");
      r.content = r.content.split(/\s+/);
  
      var counts = new Map();
  
      r.content.forEach(w => {
        if (!w) return;
        counts.set(w, (counts.get(w) || 0) + 1);
      })
  
      r.content = counts;
      r.found = true;
    });

  }
}

Plugins.catalogize(pKWIndexDoc);
