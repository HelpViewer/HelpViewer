class puiSidebarVisibilityToggle extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.buttonHide = undefined;
    this.buttonShow = undefined;
  }

  static eventDefinitions = [];

  static KEY_CFG_HIDE = 'HIDE';
  static KEY_CFG_SHOW = 'SHOW';
  static KEY_CFG_STOREKEY = 'STOREKEY';

  static ID_DOWNPB = 'downP-Hide';
  static ID_TOPPB = 'showBtn';

  init() {
    const T = this.constructor;
    const TI = this;
    const KEY_LS_SIDEBARVISIBLE = this.config[T.KEY_CFG_STOREKEY] || 'sidebarVisible';
    const captionHide = this.config[T.KEY_CFG_HIDE] || '❌︎';
    const captionShow = this.config[T.KEY_CFG_SHOW] || '☰';
    var sidebarVisible = getUserConfigValue(KEY_LS_SIDEBARVISIBLE) || 1;
    
    const _sidebarToggle = (evt) => {
      const newState = toggleSidebar();
      sidebarVisible = newState;
      toggleVisibility(TI.buttonShow, !newState);
      setUserConfigValue(KEY_LS_SIDEBARVISIBLE, String(Number(newState)));
    }
  
    TI.buttonHide = uiAddButton(T.ID_DOWNPB, captionHide, UI_PLUGIN_SIDEBAR, _sidebarToggle);
    TI.buttonShow = uiAddButton(T.ID_TOPPB, captionShow, UI_PLUGIN_HEADER, _sidebarToggle);

    toggleVisibility(TI.buttonShow, !sidebarVisible);

    if (sidebarVisible == 0)
      _sidebarToggle();

    super.init();
  }

  deInit() {
    const T = this;
    T.buttonHide?.remove();
    T.buttonShow?.remove();

    super.deInit();
  }
}

Plugins.catalogize(puiSidebarVisibilityToggle);
