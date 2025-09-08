class PluginLoaded extends IEvent {
  constructor() {
    super();
    this.className = '';
  }
}

class PluginActivated extends PluginLoaded {
  constructor() {
    super();
    this.instanceName = '';
    this.instanceObject = new IPlugin();
  }
}

class PluginOperationFailed extends PluginActivated {
  constructor() {
    super();
    this.opEventName = '';
    this.error = new Error;
  }
}

class pPluginManagement extends IPlugin {
  static EVT_PD_GET = 'PluginsDump';
  static EVT_PD_PLGLOADED = PluginLoaded.name;
  static EVT_PD_PLGACTIVATED = PluginActivated.name;
  static EVT_PD_PLGOPFAILED = PluginOperationFailed.name;
  static EVT_PD_PLGDEACTIVATED = 'PluginDeactivated';

  init() {
    loadPlugin = this._loadPlugin.bind(this);
    activatePlugin = this._activatePlugin.bind(this);
    deactivatePlugin = this._deactivatePlugin.bind(this);

    const T = this.constructor;
    const TI = this;

    const h_EVT_UC_GET = (data) => {
      data.result = [];
      data.result.push(Array.from(Plugins.pluginsClasses.keys()));
      data.result.push(Array.from(Plugins.plugins.keys()));
      data.result.push(Array.from(Plugins.plugins));
    }
    TI.eventDefinitions.push([T.EVT_PD_GET, IEvent, h_EVT_UC_GET]);

    TI.eventDefinitions.push([T.EVT_PD_PLGLOADED, PluginLoaded, null]); // outside event handlers

    TI.eventDefinitions.push([T.EVT_PD_PLGACTIVATED, PluginActivated, null]); // outside event handlers

    TI.eventDefinitions.push([T.EVT_PD_PLGOPFAILED, PluginOperationFailed, null]); // outside event handlers

    TI.eventDefinitions.push([T.EVT_PD_PLGDEACTIVATED, PluginActivated, null]); // outside event handlers

    TI.catalogizeEventCall(this._loadPlugin, T.EVT_PD_PLGLOADED);
    TI.catalogizeEventCall(this._loadPlugin, T.EVT_PD_PLGOPFAILED);

    TI.catalogizeEventCall(this._activatePlugin, T.EVT_PD_PLGACTIVATED);
    TI.catalogizeEventCall(this._activatePlugin, T.EVT_PD_PLGOPFAILED);

    TI.catalogizeEventCall(this._deactivatePlugin, T.EVT_PD_PLGDEACTIVATED);
    TI.catalogizeEventCall(this._deactivatePlugin, T.EVT_PD_PLGOPFAILED);

    super.init();
  }

  async _loadPlugin(name, file, source) {
    const reply = lc_loadPlugin(name, file, source);
    const T = this.constructor;
    const action = T.EVT_PD_PLGLOADED;
    const pluginPureName = name.split('/').pop();

    reply.then(
      ok => {
        sendEvent(action, (x) => {
          x.className = pluginPureName;
        });
      },
      error => {
        sendEvent(T.EVT_PD_PLGOPFAILED, (x) => {
          x.instanceObject = undefined;
          x.instanceName = undefined;
          x.opEventName = action;
          x.className = pluginPureName;
          x.error = error;
        });
      }
    );

    return reply;
  }

  async _activatePlugin(name, alias, source) {
    const reply = lc_activatePlugin(name, alias, source);
    const T = this.constructor;
    const action = T.EVT_PD_PLGACTIVATED;
    const pluginPureName = name.split('/').pop();

    reply.then(
      ok => {
        sendEvent(action, (x) => {
          x.className = pluginPureName;
          x.instanceObject = ok[1];
          x.instanceName = ok[0];
        });
      },
      error => {
        sendEvent(T.EVT_PD_PLGOPFAILED, (x) => {
          x.instanceObject = undefined;
          x.instanceName = alias;
          x.opEventName = action;
          x.className = pluginPureName;
          x.error = error;
        });
      }
    );

    return reply;
  }

  _deactivatePlugin(pluginName, alias) {
    const T = this.constructor;
    const action = T.EVT_PD_PLGDEACTIVATED;

    const ok = lc_deactivatePlugin(pluginName, alias);

    if (ok) {  
      sendEvent(action, (x) => {
        x.className = pluginName;
        x.instanceObject = ok[1];
        x.instanceName = ok[0];
      });  
    } else {
      sendEvent(T.EVT_PD_PLGOPFAILED, (x) => {
        x.instanceObject = undefined;
        x.instanceName = alias;
        x.opEventName = action;
        x.className = pluginName;
        x.error = new Error('Not found in plugin registry.');
      });
    }

  }

  deInit() {
    loadPlugin = lc_loadPlugin;
    activatePlugin = lc_activatePlugin;
    deactivatePlugin = lc_deactivatePlugin;

    super.deInit();
  }
  
}

Plugins.catalogize(pPluginManagement);
