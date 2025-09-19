class pTRClearPanels extends pTRPhasePlugin {
  onETShowChapterResolutions(r) {
    if (!r.containerIdContent)
      setPanelsEmpty();
  }
}

Plugins.catalogize(pTRClearPanels);
