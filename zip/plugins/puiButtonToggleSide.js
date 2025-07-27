class puiButtonToggleSide extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  static KEY_CFG_ID = 'ID';
  static KEY_CFG_CAPTION = 'CAPTION';
  static KEY_CFG_TARGET = 'TARGET';
  static KEY_CFG_STOREKEY = 'STOREKEY';

  static button;

  init() {
    const KEY_LS_SIDEBARSIDE = this.config[puiButtonToggleSide.KEY_CFG_STOREKEY] || 'sidebarSide';
    var state = getUserConfigValue(KEY_LS_SIDEBARSIDE) || 0;
    
    var toggleSidebarSideHandler = () => {
      const resolution = toggleSidebarSide();
      state = resolution;
      setUserConfigValue(KEY_LS_SIDEBARSIDE, String(Number(resolution)));
    }

    const _buttonAction = (evt) => {
      toggleSidebarSideHandler();
    }
  
    const cfgId = this.config[puiButtonFullScreen.KEY_CFG_ID] || 'downP-ToggleSide';
    const cfgCaption = this.config[puiButtonFullScreen.KEY_CFG_CAPTION] || '↔';
    const cfgTarget = this.config[puiButtonFullScreen.KEY_CFG_TARGET] || UI_PLUGIN_SIDEBAR;

    puiButtonToggleSide.button = uiAddButton(cfgId, cfgCaption, cfgTarget, _buttonAction);

    if (state == 0) 
      toggleSidebarSideHandler();

    super.init();
  }

  deInit() {
    puiButtonToggleSide.button?.remove();

    super.deInit();
  }
}

Plugins.catalogize(puiButtonToggleSide);
