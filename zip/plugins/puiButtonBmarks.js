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
    this.cfgTreeId = 'bmark';
    hideButton(this.button.id, false);
  }

  deInit() {
    super.deInit();
  }

  _preShowAction(evt) {
  }

  _preStandardInit() {
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, false);
  }

  onET_BmarksChanged(evt) {
    const state = evt.data && evt.data.length > 0;
    hideButton(this.button.id, state);
    setTreeData(state? evt.data : '', this.aliasName);
    $A('a', this.tree).forEach((x) => x.href = x.getAttribute('data-param') || '');
    openSubtree(this.tree);

    if (!this.tab.classList.contains(C_HIDDENC))
      showSidebarTab();
  }

}

Plugins.catalogize(puiButtonBmarks);
