class puiButtonTOC extends puiButtonTabTree {
  static KEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-TopicTree';
    this.DEFAULT_KEY_CFG_CAPTION = '📖';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    
    this.DEFAULT_KEY_CFG_TREEID = 'tree';
    this.DEFAULT_KEY_CFG_FILENAME = 'tree.lst';
  }
  
  init() {
    const T = this.constructor;
    const TI = this;
    this.cfgFilename = this.config[T.KEY_CFG_FILENAME] || TI.DEFAULT_KEY_CFG_FILENAME;
    super.init();
  }
  
  deInit() {
    super.deInit();
  }

  _preShowAction(evt) {
  }

  _preStandardInit() {
  }

  onET_UserDataFileLoaded(evt) {
    storageSearch(STO_HELP, this.cfgFilename).then((srcTreeData) => {
      setTreeData(srcTreeData, this.aliasName);
      const newState = srcTreeData?.length > 0;
      hideButton(this.button?.id, newState);
      hideButton(this.tab?.id, newState);
    });
  }
}
  
Plugins.catalogize(puiButtonTOC);
