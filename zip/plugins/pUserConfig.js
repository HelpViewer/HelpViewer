class UserConfigGet extends IEvent {
  constructor() {
    super();
    this.key = '';
  }
}

class UserConfigSet extends UserConfigGet {
  constructor() {
    super();
    this.value = '';
  }
}

class pUserConfig extends IPlugin {
  static EVT_UC_GET = UserConfigGet.name;
  static EVT_UC_SET = UserConfigSet.name;

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  init() {
    var h_EVT_UC_GET = (data) =>
      data.result = localStorage.getItem(data.key);
    pUserConfig.eventDefinitions.push([pUserConfig.EVT_UC_GET, UserConfigGet, h_EVT_UC_GET]);

    var h_EVT_UC_SET = (data) =>
      localStorage.setItem(data.key, data.value);
    pUserConfig.eventDefinitions.push([pUserConfig.EVT_UC_SET, UserConfigSet, h_EVT_UC_SET]);

    super.init();
  }

  deInit() {
    super.deInit();
    removeEventDefinition(pUserConfig.EVT_UC_GET);
    removeEventDefinition(pUserConfig.EVT_UC_SET);
  }
}

Plugins.catalogize(pUserConfig);
