class puiSidebarVisibilityToggle extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  static sidebarVisible = getUserConfigValue(KEY_LS_SIDEBARVISIBLE) || 1;

  static ID_DOWNPB = 'downP-Hide';
  static ID_TOPPB = 'showBtn';

  static buttons = [];

  init() {
    puiSidebarVisibilityToggle.buttons.push(uiAddButton(puiSidebarVisibilityToggle.ID_DOWNPB, '❌︎', this._sidebarToggle(), UI_PLUGIN_SIDEBAR));
    puiSidebarVisibilityToggle.buttons.push(uiAddButton(puiSidebarVisibilityToggle.ID_TOPPB, '☰', this._sidebarToggle(), UI_PLUGIN_HEADER));

    puiSidebarVisibilityToggle.buttons[1]
    if (sidebarVisible)

      else 

    super.init();
  }

  deInit() {
    puiSidebarVisibilityToggle.buttons.forEach((btn) => btn?.remove());

    super.deInit();
  }

  _sidebarToggle() {
    const newState = toggleSidebar();
    setUserConfigValue(KEY_LS_SIDEBARVISIBLE, String(Number(newState)));
  }
}

Plugins.catalogize(puiSidebarVisibilityToggle);
