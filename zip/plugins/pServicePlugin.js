class pServicePlugin extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.plugins = this.plugins || new Set();
  }

  init() {
    super.init();

    this.plgActivate = this.plgActivate || this._pluginActivated.bind(this);
    this.plgDeactivate = this.plgDeactivate || this._pluginDeactivated.bind(this);
    this.addPlugin = (pluginName, instanceName) => {
      this.plugins.add(Plugins.getKey(pluginName, instanceName));
    }

    this._doForAllInstances(this.plgActivate);
  }

  deInit() {
    this._doForAllInstances(this.plgDeactivate);
    super.deInit();
  }

  onETPluginActivated(evt) {
    evt.result = this.plgActivate?.(evt.className, evt.instanceName, evt.instanceObject, evt.storageName);
  }

  onETPluginDeactivated(evt) {
    this.plugins.delete(Plugins.getKey(evt.className, evt.instanceName));
    evt.result = this.plgDeactivate?.(evt.className, evt.instanceName, evt.instanceObject, evt.storageName);
  }

  _doForAllInstances(action) {
    if (!action || typeof action !== 'function') return;
    Plugins.plugins.forEach(x => action(x.constructor.name, x.aliasName, x, x.storageName));
  }

  _pluginActivated(pluginName, instanceName, instance, storageName) {
  }

  _pluginDeactivated(pluginName, instanceName, instance, storageName) {
  }
}

Plugins.catalogize(pServicePlugin);
