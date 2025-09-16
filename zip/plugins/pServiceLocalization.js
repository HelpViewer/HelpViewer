class pServiceLocalization extends pServicePlugin {
  init() {
    this.plgActivate = this._pluginActivated.bind(this);
    this.plgDeactivate = this._pluginDeactivated.bind(this);

    super.init();

    const TI = this;
    TI.catalogizeEventCall(TI._pluginActivated, EventNames.LocAppend);
  }

  _pluginActivated(pluginName, instanceName, instance, storageName) {
    //log('E !!!ggg', pluginName, instanceName, instance, storageName);
    log('E _pluginActivated_pluginActivated', this);

    const langFileJS = 'lstr.js';
    const langFileTXT = 'lstr.txt';
    const lang = getActiveLanguage();
    const addPlugin = this.addPlugin;
    
    Promise.all([
      storageSearch(storageName, `${pluginName}/${lang}/${langFileTXT}`),
      storageSearch(storageName, `${pluginName}/${lang}/${langFileJS}`),
    ]).then(([txt, js]) => {
      if (js) {
        addPlugin(pluginName, instanceName);
        const jsAlias = `lngk_${pluginName}`;
        $O(jsAlias)?.remove();
        appendJavaScript(jsAlias, js, document.head);
      }

      if (txt) {
        log('E !!!ggg', pluginName, instanceName, instance, storageName);
        log('E GGG found langs:', txt, instanceName);
        addPlugin(pluginName, instanceName);
        alert('x');
        sendEvent(EventNames.LocAppend, (x) => x.strings = txt);
        alert('x2');
      }
    });
  }

  onETLOC_LOADED(evt) {
    this._doForAllInstances(this._pluginActivated);
  }
}

Plugins.catalogize(pServiceLocalization);
