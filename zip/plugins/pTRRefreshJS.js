class pTRRefreshJS extends pTRPhasePlugin {
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

    //script blocks refresh
    const scripts = $A('script', r.doc);
    var idx = -1;

    scripts.forEach((oldScript) => {
      idx++;
      appendJavaScript(`scr-${idx}`, oldScript.textContent, oldScript.parentElement)
    });
  }
}

Plugins.catalogize(pTRRefreshJS);
