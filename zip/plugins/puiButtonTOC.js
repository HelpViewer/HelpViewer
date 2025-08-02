class puiButtonTOC extends puiButtonTabTree {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-TopicTree';
    this.DEFAULT_KEY_CFG_CAPTION = '📖';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    
    this.DEFAULT_KEY_CFG_TREEID = 'tree';
  }
  
  static eventDefinitions = [];
  
  init() {
    super.init();
  }
  
  deInit() {
    super.deInit();
  }

  _preShowAction(evt) {
  }

  _preStandardInit() {
  }

  _treeClick(e) {
  }
}
  
Plugins.catalogize(puiButtonTOC);
