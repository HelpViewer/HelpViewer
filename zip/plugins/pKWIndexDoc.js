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
      var content = r.content[0];
      content = content?.trim() || '';
      content = textCleanupPhrase(content).replace(/[^a-z0-9\s]/g, " ");
      content = content.split(/\s+/);
  
      var counts = new Map();
  
      content.forEach(w => {
        if (!w) return;
        counts.set(w, (counts.get(w) || 0) + 1);
      })
  
      r.content[0] = counts;
      r.found = true;
    });

  }
}

Plugins.catalogize(pKWIndexDoc);
