class pTRClearPanels extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }
  
  onETShowChapterResolutions(r) {
    setPanelsEmpty();
  }
}

Plugins.catalogize(pTRClearPanels);
