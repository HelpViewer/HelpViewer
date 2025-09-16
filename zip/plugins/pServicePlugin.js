class pServicePlugin extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.plugins = this.plugins || new Set();
  }

  init() {
    super.init();

    this._doForAllInstances(this._pluginActivated.bind(this));
  }

  addPlugin(pluginName, instanceName) {
    this.plugins.add(Plugins.getKey(pluginName, instanceName));
  }

  deInit() {
    this._doForAllInstances(this._pluginDeactivated.bind(this));
    super.deInit();
  }

  onETPluginActivated(evt) {
    evt.result = this._pluginActivated?.(evt.className, evt.instanceName, evt.instanceObject, evt.storageName);
  }

  onETPluginDeactivated(evt) {
    this.plugins.delete(Plugins.getKey(evt.className, evt.instanceName));
    evt.result = this._pluginDeactivated?.(evt.className, evt.instanceName, evt.instanceObject, evt.storageName);
  }

  _doForAllInstances(action) {
    log('E TTT _doForAllInstances', this);
    if (!action || typeof action !== 'function') return;
    const act = (x) => action(x.constructor.name, x.aliasName, x, x.storageName);
    Plugins.plugins.forEach(x => act(x));
  }

  _pluginActivated(pluginName, instanceName, instance, storageName) {
  }

  _pluginDeactivated(pluginName, instanceName, instance, storageName) {
  }
}

Plugins.catalogize(pServicePlugin);
