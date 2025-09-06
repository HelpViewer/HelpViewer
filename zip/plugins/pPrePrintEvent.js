class pPrePrintEvent extends pConvertSysEventToEvent {
  constructor(aliasName, data) {
    super(aliasName, data);
    
    this.DEFAULT_KEY_CFG_SYSEVENTNAME = 'beforeprint';
    this.DEFAULT_KEY_CFG_SYSOBJECT = 'window';
    this.DEFAULT_KEY_CFG_EVENTBUSEVENT = 'BeforePrint';  
    this.DEFAULT_KEY_CFG_EVENTBUSEVENTID = '';
  }

  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }
}

Plugins.catalogize(pPrePrintEvent);
