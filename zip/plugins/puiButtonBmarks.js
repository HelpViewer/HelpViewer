class puiButtonBmarks extends puiButtonTabTree {
  static EVT_BMARKS_SHOW = 'ShowBookmarks';

  constructor(aliasName, data) {
    super(aliasName, data);
    
    this.DEFAULT_KEY_CFG_ID = 'downP-ChapterAnchor';
    this.DEFAULT_KEY_CFG_CAPTION = '🔖';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    
    this.DEFAULT_KEY_CFG_TREEID = 'bmark';
    this.eventIdStrict = false;
  }

  init() {
    const T = this.constructor;
    const TI = this;

    const onET_ShowBookmarks = (data) => showSidebarTab(this.tab.id);
    TI.eventDefinitions.push([T.EVT_BMARKS_SHOW, IEvent, onET_ShowBookmarks]);
    super.init();

    hideButton(TI.button.id, false);
  }
  
  _preShowAction(evt) {
  }

  _preStandardInit() {
  }

  _buttonAction(evt) {
    this._buttonActionClickOpenCloseAll(evt?.event?.isTrusted);
  }

  onET_UserDataFileLoaded(evt) {
    showSidebarTab();
    hideButton(this.button.id, false);
  }

  onET_BmarksChanged(evt) {
    const state = evt.data && evt.data.length > 0;
    hideButton(this.button.id, state);
    setTreeData(state? evt.data : '', this.aliasName);
    $A('a', this.tree).forEach((x) => x.href = x.getAttribute('data-param') || '');
    openSubtree(this.tree);

    if (!state && !this.tab.classList.contains(C_HIDDENC))
      showSidebarTab();
  }

}

Plugins.catalogize(puiButtonBmarks);
