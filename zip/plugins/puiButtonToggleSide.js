class puiButtonToggleSide extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.button = undefined;
  }

  static eventDefinitions = [];

  static KEY_CFG_ID = 'ID';
  static KEY_CFG_CAPTION = 'CAPTION';
  static KEY_CFG_TARGET = 'TARGET';
  static KEY_CFG_STOREKEY = 'STOREKEY';

  init() {
    const T = puiButtonToggleSide;
    const TI = this;
    const KEY_LS_SIDEBARSIDE = this.config[T.KEY_CFG_STOREKEY] || 'sidebarSide';
    var state = getUserConfigValue(KEY_LS_SIDEBARSIDE) || 0;
    
    var toggleSidebarSideHandler = () => {
      const resolution = toggleSidebarSide();
      state = resolution;
      setUserConfigValue(KEY_LS_SIDEBARSIDE, String(Number(resolution)));
    }

    const _buttonAction = (evt) => {
      toggleSidebarSideHandler();
    }
  
    const cfgId = this.config[T.KEY_CFG_ID] || 'downP-ToggleSide';
    const cfgCaption = this.config[T.KEY_CFG_CAPTION] || '↔';
    const cfgTarget = this.config[T.KEY_CFG_TARGET] || UI_PLUGIN_SIDEBAR;

    TI.button = uiAddButton(cfgId, cfgCaption, cfgTarget, _buttonAction);

    if (state == 0) 
      toggleSidebarSideHandler();

    super.init();
  }

  deInit() {
    this.button?.remove();

    super.deInit();
  }
}

Plugins.catalogize(puiButtonToggleSide);
