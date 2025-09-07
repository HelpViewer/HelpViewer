class puiButtonFullScreen extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ToggleFS';
    this.DEFAULT_KEY_CFG_CAPTION = '🔲';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }
  
  _buttonAction(evt) {
    document.fullscreenElement 
      ? document.exitFullscreen() 
      : document.documentElement.requestFullscreen();
  }
}

Plugins.catalogize(puiButtonFullScreen);
