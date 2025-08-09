class pTR1stHeadingToTopPanel extends pTRPhasePlugin {
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

    const firstChild = r.doc.body ? r.doc.body.firstElementChild : r.doc.firstElementChild;
    const firstH1 = $O('h1', r.doc);
  
    if (firstH1 && firstChild === firstH1 && r.setTitle(firstH1.innerHTML.trim()) )
    {
      r.heading = firstH1.innerHTML.trim();
      firstH1.remove();
    }
  }
}

Plugins.catalogize(pTR1stHeadingToTopPanel);
