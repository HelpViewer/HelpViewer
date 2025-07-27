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
  
    puiButtonFullScreen.button = uiAddButton(this.config[puiButtonFullScreen.KEY_CFG_ID], this.config[puiButtonFullScreen.KEY_CFG_CAPTION], this.config[puiButtonFullScreen.KEY_CFG_TARGET], _buttonAction);

    super.init();
  }

  deInit() {
    puiButtonFullScreen.button?.remove();

    super.deInit();
  }
}

Plugins.catalogize(puiButtonFullScreen);
