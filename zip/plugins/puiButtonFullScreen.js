class puiButtonFullScreen extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  static KEY_CFG_ID = 'ID';
  static KEY_CFG_CAPTION = 'CAPTION';
  static KEY_CFG_TARGET = 'TARGET';

  static button;

  init() {
    const _buttonAction = (evt) => {
      document.fullscreenElement 
        ? document.exitFullscreen() 
        : document.documentElement.requestFullscreen();  
    }
  
    const cfgId = this.config[puiButtonFullScreen.KEY_CFG_ID] || 'downP-ToggleFS';
    const cfgCaption = this.config[puiButtonFullScreen.KEY_CFG_CAPTION] || '🔲';
    const cfgTarget = this.config[puiButtonFullScreen.KEY_CFG_TARGET] || UI_PLUGIN_SIDEBAR;
    puiButtonFullScreen.button = uiAddButton(cfgId, cfgCaption, cfgTarget, _buttonAction);

    super.init();
  }

  deInit() {
    puiButtonFullScreen.button?.remove();

    super.deInit();
  }
}

Plugins.catalogize(puiButtonFullScreen);
