class pTRClearPanels extends pTRPhasePlugin {
  onETShowChapterResolutions(r) {
    setPanelsEmpty();
  }
}

Plugins.catalogize(pTRClearPanels);
