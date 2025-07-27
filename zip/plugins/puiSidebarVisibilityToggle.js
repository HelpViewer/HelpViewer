class puiSidebarVisibilityToggle extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  static KEY_CFG_HIDE = 'HIDE';
  static KEY_CFG_SHOW = 'SHOW';
  static KEY_CFG_STOREKEY = 'STOREKEY';

  static ID_DOWNPB = 'downP-Hide';
  static ID_TOPPB = 'showBtn';

  static buttonHide;
  static buttonShow;

  init() {
    const KEY_LS_SIDEBARVISIBLE = this.config[puiSidebarVisibilityToggle.KEY_CFG_STOREKEY] || 'sidebarVisible';
    const captionHide = this.config[puiSidebarVisibilityToggle.KEY_CFG_HIDE] || '❌︎';
    const captionShow = this.config[puiSidebarVisibilityToggle.KEY_CFG_SHOW] || '☰';
    var sidebarVisible = getUserConfigValue(KEY_LS_SIDEBARVISIBLE) || 1;
    
    const _sidebarToggle = (evt) => {
      const newState = toggleSidebar();
      sidebarVisible = newState;
      toggleVisibility(puiSidebarVisibilityToggle.buttonShow, !newState);
      setUserConfigValue(KEY_LS_SIDEBARVISIBLE, String(Number(newState)));
    }
  
    puiSidebarVisibilityToggle.buttonHide = uiAddButton(puiSidebarVisibilityToggle.ID_DOWNPB, captionHide, UI_PLUGIN_SIDEBAR, _sidebarToggle);
    puiSidebarVisibilityToggle.buttonShow = uiAddButton(puiSidebarVisibilityToggle.ID_TOPPB, captionShow, UI_PLUGIN_HEADER, _sidebarToggle);

    toggleVisibility(puiSidebarVisibilityToggle.buttonShow, !sidebarVisible);

    if (sidebarVisible == 0)
      _sidebarToggle();

    super.init();
  }

  deInit() {
    puiSidebarVisibilityToggle.buttonHide?.remove();
    puiSidebarVisibilityToggle.buttonShow?.remove();

    super.deInit();
  }
}

Plugins.catalogize(puiSidebarVisibilityToggle);
