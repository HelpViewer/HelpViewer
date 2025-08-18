class puiButtonObjectExplorer extends puiButtonTab {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ObjectExplorer';
    this.DEFAULT_KEY_CFG_CAPTION = '🧩';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }

  init() {
    super.init();
    hideButton(this.button.id, false);
  }

  deInit() {
    super.deInit();
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, true);
  }

  _preShowAction(evt) {
  }

  _buttonAction(evt) {
    if (this.tab.classList.contains(C_HIDDENC)) {
      super._buttonAction();
    } else {

    }
  }

  onET_ChapterShown(evt) {
  }

}

Plugins.catalogize(puiButtonObjectExplorer);
