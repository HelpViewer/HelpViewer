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

    const firstH1 = r.doc.firstElementChild;
  
    if (firstH1 && firstH1.tagName.toLowerCase() === 'h1' && r.setTitle(firstH1.innerHTML.trim()) )
      firstH1.remove();

  }
}

Plugins.catalogize(pTR1stHeadingToTopPanel);
