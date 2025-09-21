class puiButtonTOC extends puiButtonTabTree {
  static EVT_TOC_GETDATA = 'GetTOCData';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-TopicTree';
    this.DEFAULT_KEY_CFG_CAPTION = '📖';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    
    this.DEFAULT_KEY_CFG_TREEID = 'tree';
    this.DEFAULT_KEY_CFG_FILENAME = 'tree.lst';
    this.eventIdStrict = false;
  }
  
  init() {
    const T = this.constructor;
    const TI = this;

    const onET_GetTOCData = (evt) => evt.result = this._getTOCData();
    TI.eventDefinitions.push([T.EVT_TOC_GETDATA, IEvent, onET_GetTOCData]);

    super.init();
    hideButton(TI.button.id, false);

    TI.catalogizeEventCall(TI.init, EventNames.ElementSetVisibility);

    TI.catalogizeEventCall(TI.onET_UserDataFileLoaded, EventNames.ElementSetVisibility);
    TI.catalogizeEventCall(TI.onET_UserDataFileLoaded, EventNames.SetTreeData);
    TI.catalogizeEventCall(TI.onET_UserDataFileLoaded, EventNames.StorageGetImages);
  }
  
  _preShowAction(evt) {
  }

  _preStandardInit() {
  }

  _buttonAction(evt) {
    this._buttonActionClickOpenCloseAll(evt?.event?.isTrusted);
  }

  onET_UserDataFileLoaded(evt) {
    this._getTOCData().then((srcTreeData) => {
      setTreeData(srcTreeData, this.aliasName);
      fixImgRelativePathToZipPaths(tree, STO_HELP);
      const newState = srcTreeData?.length > 0;
      hideButton(this.button?.id, newState);
      hideButton(this.tab?.id, newState);
    });
  }

  _getTOCData() {
    return storageSearch(STO_HELP, this.cfgFILENAME);
  }
}
  
Plugins.catalogize(puiButtonTOC);
