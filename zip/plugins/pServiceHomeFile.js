class pServiceHomeFile extends IPlugin {
  static EVT_HOME_GETDATA = 'GetHomePageData';

  constructor(aliasName, data) {
    super(aliasName, data);

    const TI = this;
    TI.DEFAULT_KEY_CFG_HOME = '';
    TI.DEFAULT_KEY_CFG_HELPFILECONFIGKEY = CFG_KEY_HOME;
    TI.DEFAULT_KEY_CFG_HOMERESOLVED = TI.DEFAULT_KEY_CFG_HOME;
  }

  init() {
    const T = this.constructor;
    const TI = this;

    const onET_GetHomePageData = (evt) => evt.result = TI.cfgHOMERESOLVED;
    TI.eventDefinitions.push([T.EVT_HOME_GETDATA, IEvent, onET_GetHomePageData]);

    super.init();
  }

  onET_ConfigFileReloadFinished(evt) {
    if (evt.id != FILE_CONFIG)
      return;

    const TI = this;
    const helpFile = configGetValue(TI.cfgHELPFILECONFIGKEY, undefined, FILE_CONFIG);
    TI.cfgHOMERESOLVED = helpFile || TI.cfgHOME || FILENAME_1STTOPIC;
    TI.config['HOMERESOLVED'] = TI.cfgHOMERESOLVED;
    log('E Home file resolution (values), result:', [helpFile, TI.cfgHOME, FILENAME_1STTOPIC], TI.cfgHOMERESOLVED);
  }
}

Plugins.catalogize(pServiceHomeFile);
