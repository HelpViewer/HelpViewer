class pPrePrintEvent extends IPlugin {
  static EVT_BEFORE_PRINT = 'BeforePrint';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    const T = this.constructor;
    const TI = this;

    TI.SEVT_BEFOREPRINT = new SystemEventHandler('', undefined, window, 'beforeprint', this._beforeprint);
    TI.SEVT_BEFOREPRINT.init();
    TI.catalogizeEventCall(this._beforeprint, T.EVT_BEFORE_PRINT);

    super.init();
  }

  deInit() {
    super.deInit();
  }

  _beforeprint() {
    const T = pPrePrintEvent;
    sendEvent(T.EVT_BEFORE_PRINT);    
  }
}

Plugins.catalogize(pPrePrintEvent);
