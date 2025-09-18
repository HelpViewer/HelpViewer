class pServiceLocalization extends pServicePlugin {
  init() {
    super.init();

    const TI = this;
    TI.catalogizeEventCall(TI._pluginActivated, EventNames.LocAppend);
  }

  _pluginActivated(pluginName, instanceName, instance, storageName) {
    const langFileJS = 'lstr.js';
    const langFileTXT = 'lstr.txt';
    const lang = this.lang
    const baseDir = storageName == STO_DATA ? `${pluginName}/${lang}` : `../${lang}/${pluginName}`;
    
    Promise.all([
      storageSearch(storageName, `${baseDir}/${langFileTXT}`),
      storageSearch(storageName, `${baseDir}/${langFileJS}`),
    ]).then(([txt, js]) => {
      if (js) {
        this.addPlugin(pluginName, instanceName);
        const jsAlias = `lngk_${pluginName}`;
        $O(jsAlias)?.remove();
        appendJavaScript(jsAlias, js, document.head);
      }

      if (txt) {
        this.addPlugin(pluginName, instanceName);
        sendEvent(EventNames.LocAppend, (x) => x.strings = txt);
      }
    });
  }

  onETLOC_LOADED(evt) {
    this.lang = evt.name;
    this._doForAllInstances(this._pluginActivated.bind(this));
  }
}

Plugins.catalogize(pServiceLocalization);
