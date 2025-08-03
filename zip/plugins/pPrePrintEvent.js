class pPrePrintEvent extends IPlugin {
  static EVT_BEFORE_PRINT = 'BeforePrint';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    window.addEventListener('beforeprint', this._beforeprint);

    super.init();
  }

  deInit() {
    window.removeEventListener('beforeprint', this._beforeprint);

    super.deInit();
  }

  _beforeprint() {
    const T = pPrePrintEvent;
    sendEvent(T.EVT_BEFORE_PRINT);    
  }
}

Plugins.catalogize(pPrePrintEvent);
