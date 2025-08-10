class puiButtonBmarks extends puiButtonTabTree {
  constructor(aliasName, data) {
    super(aliasName, data);
    
    this.DEFAULT_KEY_CFG_ID = 'downP-ChapterAnchor';
    this.DEFAULT_KEY_CFG_CAPTION = '🔖';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    
    this.DEFAULT_KEY_CFG_TREEID = 'subsList';
  }

  init() {
    super.init();
    const T = this.constructor;
    const TI = this;
    this.cfgTreeId = 'tr-' + newUID(6);
  }

  deInit() {
    super.deInit();
  }

  _preShowAction(evt) {
  }

  _preStandardInit() {
  }
}

Plugins.catalogize(puiButtonBmarks);
