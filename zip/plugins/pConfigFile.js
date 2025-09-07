class ConfigFileGet extends IEvent {
  constructor() {
    super();
    this.key = '';
    this.backup = '';
  }
}

class pConfigFile extends IPlugin {
  static EVT_CF_GET = ConfigFileGet.name;
  static EVT_CF_RELOAD = 'ConfigFileReload';
  static EVT_CF_RELOAD_FINISHED = 'ConfigFileReloadFinished';

  static KEY_CFG_STORAGE = 'STORAGE';
  static KEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_STORAGE = 'STO_DATA';
    this.DEFAULT_KEY_CFG_FILENAME = '_config.txt';
    const T = this.constructor;
    this.cfgStorage = this.config[T.KEY_CFG_STORAGE] || this.DEFAULT_KEY_CFG_STORAGE;
    this.cfgFileName = this.config[T.KEY_CFG_FILENAME] || this.DEFAULT_KEY_CFG_FILENAME;

    this.CFG = undefined;

    this.eventIdStrict = true;
    this._loadCFG();
  }

  init() {
    const T = this.constructor;
    const TI = this;

    const h_EVT_CF_GET = (data) => {
      data.result = this._configGetValue(data.key, data.backup);  
    }
    TI.eventDefinitions.push([T.EVT_CF_GET, ConfigFileGet, h_EVT_CF_GET]);
    TI.catalogizeEventCall(h_EVT_CF_GET, T.EVT_CF_GET, FILE_CONFIG_DEFAULT);

    const h_EVT_CF_RELOAD = IPlugin.wrapAsyncHandler((data) => {
      this._loadCFG();
      data.result = this.aliasName;
    });
    TI.eventDefinitions.push([T.EVT_CF_RELOAD, IEvent, h_EVT_CF_RELOAD]);

    TI.eventDefinitions.push([T.EVT_CF_RELOAD_FINISHED, IEvent, null]); // outside event handlers

    super.init();
  }
  
  onET_UserDataFileLoaded(evt) {
    this._loadCFG();
  }

  async _loadCFG() {
    const T = this.constructor;
    const thisCfg = '.';

    if (this.cfgStorage == thisCfg && this.cfgFileName == thisCfg) {
      this.CFG = this.config;
    } else {
      const found = await storageSearch(this.cfgStorage, this.cfgFileName);
      this.CFG = parseConfigFile(found);
    }

    sendEvent(T.EVT_CF_RELOAD_FINISHED, (x) => {
      x.id = this.aliasName;
      x.result = `${this.cfgStorage}:${this.cfgFileName}`;
    });
  }

  _configGetValue(key, backup) {
    return this.CFG?.[key] ?? backup ?? (
      (this.aliasName === FILE_CONFIG_DEFAULT) ? undefined :
        configGetValue(key, backup, FILE_CONFIG_DEFAULT)
    );
  }
}

Plugins.catalogize(pConfigFile);
