class pTREmptyPlugin extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  /*
  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }
  */

  onETShowChapterResolutions(r) {
  }
}

Plugins.catalogize(pTREmptyPlugin);
