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

  _treeClick(e) {
    //TODO : refactor
    var event = e.event;
    const target = event.target;
    if (!target) return;
  
    const a = target.closest('a');
    if (!a) return;
  
    var targName = target.id.split('|');
    var idI = targName[1];
    targName = targName[0];
    if (targName === N_P_TREEITEM) {
      idI = parseInt(idI);
      if (idI) {
        idxTreeItem = idI;
      }
    }
  
    var data = target.getAttribute('data-param');
    if (!data) return;
  
    e.event.preventDefault();
    data = data.split(';');
    var path = data[0];
  
    if (path.startsWith('@')) {
      path = path.substring(1).split(":");
      event.preventDefault();
      //searchKeywordE(target, path[0], path[1]);
      const p = document.createElement('span');
      a.parentNode.replaceChild(p, a);
      p.innerHTML = a.innerHTML;
    } else
    if (path.startsWith('#')) {
      event.preventDefault();
      scrollToAnchor(path.substring(1));
    } else
    {
      loadPage(event, path, target.innerHTML, idI);
    }
  }

  onET_UserDataFileLoaded(evt) {
    storageSearch(STO_HELP, this.cfgFilename).then((srcTreeData) => {
      setTreeData(srcTreeData, this.cfgTreeId);
      const newState = srcTreeData?.length > 0;
      hideButton(this.button?.id, newState);
      hideButton(this.tab?.id, newState);
    });
  }
}
  
Plugins.catalogize(puiButtonTOC);
