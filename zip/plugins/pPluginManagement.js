class pPluginManagement extends IPlugin {
  static EVT_PD_GET = 'PluginsDump';

  constructor(aliasName, data) {
  super(aliasName, data);
  }

  init() {
    const T = this.constructor;
    const TI = this;
    const h_EVT_UC_GET = (data) => {
      data.result = [];
      data.result.push(Array.from(Plugins.pluginsClasses.keys()));
      data.result.push(Array.from(Plugins.plugins.keys()));
      data.result.push(Array.from(Plugins.plugins));
    }
    TI.eventDefinitions.push([T.EVT_PD_GET, IEvent, h_EVT_UC_GET]);

    super.init();
  }

  deInit() {
    super.deInit();
  }
}

Plugins.catalogize(pPluginManagement);
