class puiSidebarVisibilityToggle extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.buttonHide = undefined;
    this.buttonShow = undefined;

    this.DEFAULT_KEY_CFG_STOREKEY = 'sidebarVisible';
    this.DEFAULT_KEY_CFG_HIDE = '❌︎';
    this.DEFAULT_KEY_CFG_SHOW = '☰';
  }

  static ID_DOWNPB = 'downP-Hide';
  static ID_TOPPB = 'showBtn';

  init() {
    const T = this.constructor;
    const TI = this;

    TI.KEY_LS_SIDEBARVISIBLE = TI.cfgSTOREKEY;
    TI.sidebarVisible = getUserConfigValue(TI.KEY_LS_SIDEBARVISIBLE) || 1;
    
    const _sidebarToggle = (evt) => {
      const newState = toggleSidebar();
      this._refreshInternalState(newState);
    }
  
    TI.buttonHide = uiAddButton(T.ID_DOWNPB, TI.cfgHIDE, UI_PLUGIN_SIDEBAR, _sidebarToggle);
    TI.buttonShow = uiAddButton(T.ID_TOPPB, TI.cfgSHOW, UI_PLUGIN_HEADER, _sidebarToggle);

    toggleVisibility(TI.buttonShow, !TI.sidebarVisible);

    if (TI.sidebarVisible == 0)
      _sidebarToggle();

    TI.catalogizeEventCall(TI.init, EventNames.ButtonCreate);
    TI.catalogizeEventCall(TI.init, EventNames.ButtonSend);
    TI.catalogizeEventCall(TI.init, EventNames.UserConfigGet);
    TI.catalogizeEventCall(TI.init, EventNames.SidebarVisibilitySet);
    
    super.init();
  }

  deInit() {
    const T = this;
    T.buttonHide?.remove();
    T.buttonShow?.remove();

    super.deInit();
  }

  onET_SidebarVisibilitySet(evt) {
    const newState = evt.result;
    this._refreshInternalState(newState);
  }

  _refreshInternalState(newState) {
    const TI = this;
    TI.sidebarVisible = newState;
    toggleVisibility(TI.buttonShow, !newState);
    setUserConfigValue(TI.KEY_LS_SIDEBARVISIBLE, String(Number(newState)));
  }
}

Plugins.catalogize(puiSidebarVisibilityToggle);
