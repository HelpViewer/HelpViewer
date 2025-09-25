class puiButtonHome extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-Home';
    this.DEFAULT_KEY_CFG_CAPTION = '🏡';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }

  init() {
    const T = this.constructor;
    const TI = this;

    super.init();

    hideButton(TI.button.id, false);
  }
  
  _buttonAction(evt) {
    if (!evt.event.isTrusted)
      return;
    
    const homePath = getHomePageData();
    showChapter(null, undefined, homePath, null);
    setToHrefByValues((x) => {
      x.kvlist.set(PAR_NAME_PAGE, homePath);
      x.kvlist.set(PAR_NAME_ID, 1);
    });
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, true);
  }
}

Plugins.catalogize(puiButtonHome);
