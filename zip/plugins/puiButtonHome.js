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
    super.init();

    const T = this.constructor;
    const TI = this;
    this.cfgHomePage = this.config[T.KEY_CFG_HOME] || TI.DEFAULT_KEY_CFG_HOME;
    alert(':: ' + this.cfgHomePage);

    const onET_GetHomePageData = null;//(evt) => evt.result = this.cfgHomePage;
    TI.eventDefinitions.push([T.EVT_HOME_GETDATA, IEvent, onET_GetHomePageData]);
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    showChapter(null, undefined, this.cfgHomePage, null);
  }

  onET_GetHomePageData(evt) {
    evt.result = this.cfgHomePage;
  }
}

Plugins.catalogize(puiButtonHome);
