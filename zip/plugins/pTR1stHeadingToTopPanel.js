class pTR1stHeadingToTopPanel extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    const TI = this;

    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.HeaderSet);

    super.init();
  }

  deInit() {
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    const firstChild = this.doc(r).firstElementChild;
    const firstH1 = $O('h1', r.doc);
  
    if (firstH1 && firstChild === firstH1 && r.setTitle(firstH1.innerHTML.trim()) )
    {
      r.heading = firstH1.innerHTML.trim();
      firstH1.remove();
    }
  }
}

Plugins.catalogize(pTR1stHeadingToTopPanel);
