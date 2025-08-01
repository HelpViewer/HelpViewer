class puiButtonColorTheme extends puiButton {
    constructor(aliasName, data) {
      super(aliasName, data);

      this.DEFAULT_KEY_CFG_ID = 'downP-SwitchColorMode';
      this.DEFAULT_KEY_CFG_CAPTION = '🎨';
      this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    }
  
    static eventDefinitions = [];
  
    init() {
      super.init();
    }
  
    deInit() {
      super.deInit();
    }

    _buttonAction(evt) {
      setColorMode();
    }
  }
  
  Plugins.catalogize(puiButtonColorTheme);
  