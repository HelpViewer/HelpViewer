class puiButtonColorTheme extends IPlugin {
    constructor(aliasName, data) {
      super(aliasName, data);
      this.button = undefined;
    }
  
    static eventDefinitions = [];
  
    static KEY_CFG_ID = 'ID';
    static KEY_CFG_CAPTION = 'CAPTION';
    static KEY_CFG_TARGET = 'TARGET';
  
    init() {
      const T = puiButtonColorTheme;
      const _buttonAction = (evt) => {
        setColorMode();
      }
    
      const cfgId = this.config[T.KEY_CFG_ID] || 'downP-SwitchColorMode';
      const cfgCaption = this.config[T.KEY_CFG_CAPTION] || '🎨';
      const cfgTarget = this.config[T.KEY_CFG_TARGET] || UI_PLUGIN_SIDEBAR;
      this.button = uiAddButton(cfgId, cfgCaption, cfgTarget, _buttonAction);
  
      super.init();
    }
  
    deInit() {
      this.button?.remove();
  
      super.deInit();
    }
  }
  
  Plugins.catalogize(puiButtonColorTheme);
  