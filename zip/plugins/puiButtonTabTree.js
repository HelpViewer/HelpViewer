class SetTreeData extends IEvent {
  constructor() {
    super();
    this.data = undefined;
    this.targetTree = '';
    this.append = false;
  }
}

class ClickedEventTree extends ClickedEvent {
  constructor() {
    super();
    this.treeId = undefined;
  }
}

class puiButtonTabTree extends puiButtonTab {
  static EVT_SET_TREE_DATA = SetTreeData.name;
  static EVT_TREE_DATA_CHANGED = 'TreeDataChanged';
  static EVT_TREE_CLICKED = ClickedEventTree.name;

  static KEY_CFG_TREEID = 'TREEID';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.tree = undefined;

    this.DEFAULT_KEY_CFG_TREEID = 'tree';
    this.eventIdStrict = true;
  }

  init() {
    const TI = this;
    const T = this.constructor;
    this.cfgTreeId = this.config[T.KEY_CFG_TREEID] || TI.DEFAULT_KEY_CFG_TREEID;
    var tree = null;

    const h_EVT_SET_TREE_DATA = (data) => {
      if (data.id != this.aliasName)
        return;

      if (!data.append)
        tree.textContent = '';

      tree.insertAdjacentHTML('beforeend', linesToHtmlTree(data.data, this.cfgTreeId));

      data.targetTree = this.cfgTreeId;
      data.result = this.aliasName;

      sendEvent(T.EVT_TREE_DATA_CHANGED, (dc) => {
        dc.data = data.data;
        dc.targetTree = data.targetTree;
        dc.append = data.append;
        dc.id = this.aliasName;
      });
    };
    TI.eventDefinitions.push([T.EVT_SET_TREE_DATA, SetTreeData, h_EVT_SET_TREE_DATA]);
    TI.eventDefinitions.push([T.EVT_TREE_DATA_CHANGED, SetTreeData, null]); // outside event handlers
    TI.eventDefinitions.push([T.EVT_TREE_CLICKED, ClickedEventTree, null]); // outside event handlers

    TI.catalogizeEventCall(TI.init, ClickedEventTree.name);
    TI.catalogizeEventCall(h_EVT_SET_TREE_DATA, T.EVT_TREE_DATA_CHANGED);

    super.init();
    TI._preStandardInit();

    this.tree = uiAddTreeView(TI.cfgTreeId, TI.tab);
    tree = this.tree;

    registerOnClick(TI.cfgTreeId, (e) => {
      const result = this._treeClick(e);
      _notifyClickedEvent(e, result, this.cfgTreeId);
    });
  }
  
  _preStandardInit() {
  }

  _treeClick(e) {
    const a = e.event.target?.closest('a');
    if (a) 
      processAClick(a, e);
  }

  _buttonActionClickOpenCloseAll(isTrusted) {
    if (this.tab.classList.contains(C_HIDDENC)) {
      super._buttonAction();
    } else {
      if (!isTrusted) return;
      if ($O('details:not([open])', this.tree))
        openSubtree(this.tree);
      else
        closeSubtree(this.tree);
    }
  }
  
}

Plugins.catalogize(puiButtonTabTree);
