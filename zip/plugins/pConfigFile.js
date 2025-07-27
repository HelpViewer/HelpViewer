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

  static KEY_CFG_STORAGE = 'STORAGE';
  static KEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.CFG = undefined;

    if (aliasName === FILE_CONFIG_DEFAULT)
      this._loadCFG();
  }

  static eventDefinitions = [];

  init() {
    const h_EVT_CF_GET = (data) => {
      data.result = this._configGetValue(data.key, data.backup);  
    }
    pConfigFile.eventDefinitions.push([pConfigFile.EVT_CF_GET, ConfigFileGet, h_EVT_CF_GET]);

    const h_EVT_CF_RELOAD = IPlugin.wrapAsyncHandler((data) => {
      this._loadCFG();
      data.result = this.aliasName;
    });
    pConfigFile.eventDefinitions.push([pConfigFile.EVT_CF_RELOAD, IEvent, h_EVT_CF_RELOAD]);

    this.eventIdStrict = true;
    super.init();
  }

  deInit() {
    super.deInit();
  }

  async _loadCFG() {
    const found = await storageSearch(this.config[pConfigFile.KEY_CFG_STORAGE], this.config[pConfigFile.KEY_CFG_FILENAME]);
    this.CFG = parseConfigFile(found);
  }

  _configGetValue(key, backup) {
    return this.CFG?.[key] ?? backup ?? (
      (this.aliasName === FILE_CONFIG_DEFAULT) ? undefined :
        configGetValue(key, backup, FILE_CONFIG_DEFAULT)
    );
  }
}

Plugins.catalogize(pConfigFile);
