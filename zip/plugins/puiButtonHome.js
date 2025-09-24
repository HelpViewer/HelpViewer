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

    const onET_GetHomePageData = (evt) => evt.result = TI.cfgHOME;
    TI.eventDefinitions.push([T.EVT_HOME_GETDATA, IEvent, onET_GetHomePageData]);
    super.init();

    hideButton(TI.button.id, false);
  }
  
  _buttonAction(evt) {
    if (!evt.event.isTrusted)
      return;
    
    showChapter(null, undefined, this.cfgHOME, null);
    setToHrefByValues((x) => {
      x.kvlist.set(PAR_NAME_PAGE, this.cfgHOME);
      x.kvlist.set(PAR_NAME_ID, 1);
    });
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, true);
  }
}

Plugins.catalogize(puiButtonHome);
