class pServiceLocalization extends pServicePlugin {
  init() {
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
    
    Promise.all([
      storageSearch(storageName, `${pluginName}/${lang}/${langFileTXT}`),
      storageSearch(storageName, `${pluginName}/${lang}/${langFileJS}`),
    ]).then(([txt, js]) => {
      if (js) {
        this.addPlugin(pluginName, instanceName);
        const jsAlias = `lngk_${pluginName}`;
        $O(jsAlias)?.remove();
        appendJavaScript(jsAlias, js, document.head);
      }

      if (txt) {
        log('E !!!ggg', pluginName, instanceName, instance, storageName);
        log('E GGG found langs:', txt, instanceName);
        this.addPlugin(pluginName, instanceName);
        alert('x');
        sendEvent(EventNames.LocAppend, (x) => x.strings = txt);
        alert('x2');
      }
    });
  }

  onETLOC_LOADED(evt) {
    this._doForAllInstances(this._pluginActivated.bind(this));
  }
}

Plugins.catalogize(pServiceLocalization);
