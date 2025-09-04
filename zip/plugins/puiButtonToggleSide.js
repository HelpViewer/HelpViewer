class puiButtonToggleSide extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);
    
    this.DEFAULT_KEY_CFG_ID = 'downP-ToggleSide';
    this.DEFAULT_KEY_CFG_CAPTION = '↔';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }

  static KEY_CFG_STOREKEY = 'STOREKEY';

  init() {
    const T = this.constructor;
    const TI = this;

    this.KEY_LS_SIDEBARSIDE = this.config[T.KEY_CFG_STOREKEY] || 'sidebarSide';
    this.state = getUserConfigValue(this.KEY_LS_SIDEBARSIDE) || 0;
    
    if (this.state == 0) 
      this.toggleSidebarSideHandler();

    TI.catalogizeEventCall(TI.init, EventNames.UserConfigGet);
    
    super.init();
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    this.toggleSidebarSideHandler();
  }

  toggleSidebarSideHandler() {
    const resolution = toggleSidebarSide();
    this.state = resolution;
    setUserConfigValue(this.KEY_LS_SIDEBARSIDE, String(Number(resolution)));
  }
}

Plugins.catalogize(puiButtonToggleSide);
