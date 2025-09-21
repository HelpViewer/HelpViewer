class puiButtonToggleSide extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);
    
    this.DEFAULT_KEY_CFG_ID = 'downP-ToggleSide';
    this.DEFAULT_KEY_CFG_CAPTION = '↔';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    this.DEFAULT_KEY_CFG_STOREKEY = 'sidebarSide';
  }

  init() {
    const TI = this;

    TI.state = getUserConfigValue(TI.cfgSTOREKEY) || 0;
    
    if (this.state == 0) 
      this.toggleSidebarSideHandler();

    TI.catalogizeEventCall(TI.init, EventNames.UserConfigGet);
    
    super.init();
  }
  
  _buttonAction(evt) {
    this.toggleSidebarSideHandler();
  }

  toggleSidebarSideHandler() {
    const resolution = toggleSidebarSide();
    this.state = resolution;
    setUserConfigValue(this.cfgSTOREKEY, String(Number(resolution)));
  }
}

Plugins.catalogize(puiButtonToggleSide);
