class puiButtonHome extends puiButton {
  static EVT_HOME_GETDATA = 'GetHomePageData';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-Home';
    this.DEFAULT_KEY_CFG_CAPTION = '🏡';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_HOME = FILENAME_1STTOPIC;
  }

  init() {
    const T = this.constructor;
    const TI = this;
    this.cfgHomePage = this.config[T.KEY_CFG_HOME] || TI.DEFAULT_KEY_CFG_HOME;
    const onET_GetHomePageData = (evt) => evt.result = this.cfgHomePage;
    TI.eventDefinitions.push([T.EVT_HOME_GETDATA, IEvent, onET_GetHomePageData]);
    super.init();

    hideButton(TI.button.id, false);
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    if (!evt.event.isTrusted)
      return;
    
    showChapter(null, undefined, this.cfgHomePage, null);
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, true);
  }
}

Plugins.catalogize(puiButtonHome);
