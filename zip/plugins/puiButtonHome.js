class puiButtonHome extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-Home';
    this.DEFAULT_KEY_CFG_CAPTION = '🏡';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_HOME = 'README.md';
  }

  init() {
    super.init();

    const T = this.constructor;
    const TI = this;
    this.cfgHomePage = this.config[T.KEY_CFG_HOME] || TI.DEFAULT_KEY_CFG_HOME;
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    showChapter(null, undefined, this.cfgHomePage, null);
  }
}

Plugins.catalogize(puiButtonHome);
