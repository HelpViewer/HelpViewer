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

  init() {
    const T = this.constructor;
    const TI = this;
    const h_EVT_UC_GET = (data) =>
      data.result = localStorage.getItem(data.key);
    TI.eventDefinitions.push([T.EVT_UC_GET, UserConfigGet, h_EVT_UC_GET]);

    const h_EVT_UC_SET = (data) =>
      localStorage.setItem(data.key, data.value);
    TI.eventDefinitions.push([T.EVT_UC_SET, UserConfigSet, h_EVT_UC_SET]);

    super.init();
  }
}

Plugins.catalogize(pUserConfig);
