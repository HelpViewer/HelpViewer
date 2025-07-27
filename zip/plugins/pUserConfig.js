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
    const T = pUserConfig;
    const h_EVT_UC_GET = (data) =>
      data.result = localStorage.getItem(data.key);
    T.eventDefinitions.push([T.EVT_UC_GET, UserConfigGet, h_EVT_UC_GET]);

    const h_EVT_UC_SET = (data) =>
      localStorage.setItem(data.key, data.value);
    T.eventDefinitions.push([T.EVT_UC_SET, UserConfigSet, h_EVT_UC_SET]);

    super.init();
  }

  deInit() {
    super.deInit();
  }
}

Plugins.catalogize(pUserConfig);
