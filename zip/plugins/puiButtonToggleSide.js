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
    const KEY_LS_SIDEBARSIDE = this.config[puiButtonToggleSide.KEY_CFG_STOREKEY];
    var state = getUserConfigValue(KEY_LS_SIDEBARSIDE) || 0;
    
    var toggleSidebarSideHandler = () => {
      const resolution = toggleSidebarSide();
      state = resolution;
      setUserConfigValue(KEY_LS_SIDEBARSIDE, String(Number(resolution)));
    }

    const _buttonAction = (evt) => {
      toggleSidebarSideHandler();
    }
  
    puiButtonToggleSide.button = uiAddButton(this.config[puiButtonToggleSide.KEY_CFG_ID], this.config[puiButtonToggleSide.KEY_CFG_CAPTION], this.config[puiButtonToggleSide.KEY_CFG_TARGET], _buttonAction);

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
