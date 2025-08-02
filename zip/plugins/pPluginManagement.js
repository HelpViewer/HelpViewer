class pPluginManagement extends IPlugin {
  static EVT_PD_GET = 'PluginsDump';

  constructor(aliasName, data) {
  super(aliasName, data);
  }

  static eventDefinitions = [];

  init() {
    const T = this.constructor;
    const h_EVT_UC_GET = (data) => {
      data.result = [];
      data.result.push(Array.from(Plugins.pluginsClasses.keys()));
      data.result.push(Array.from(Plugins.plugins.keys()));
    }
    T.eventDefinitions.push([T.EVT_PD_GET, IEvent, h_EVT_UC_GET]);

    super.init();
  }

  deInit() {
    super.deInit();
  }
}

Plugins.catalogize(pPluginManagement);
