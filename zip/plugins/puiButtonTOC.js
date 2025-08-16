class puiButtonTOC extends puiButtonTabTree {
  static EVT_TOC_GETDATA = 'GetTOCData';

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

    TI.eventDefinitions.push([T.EVT_TOC_GETDATA, IEvent, null]);

    super.init();
  }
  
  deInit() {
    super.deInit();
  }

  _preShowAction(evt) {
  }

  _preStandardInit() {
  }

  _buttonAction(evt) {
    this._buttonActionClickOpenCloseAll();
  }

  onET_UserDataFileLoaded(evt) {
    this._getTOCData().then((srcTreeData) => {
      setTreeData(srcTreeData, this.aliasName);
      const newState = srcTreeData?.length > 0;
      hideButton(this.button?.id, newState);
      hideButton(this.tab?.id, newState);
      hideButton('downP-ShowAsBook', newState);
    });
  }

  _getTOCData() {
    return storageSearch(STO_HELP, this.cfgFilename);
  }

  onET_GetTOCData(evt) {
    evt.result = this._getTOCData();
  }
}
  
Plugins.catalogize(puiButtonTOC);
