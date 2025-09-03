class pTRClearPanels extends pTRPhasePlugin {
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
    setPanelsEmpty();
  }
}

Plugins.catalogize(pTRClearPanels);
