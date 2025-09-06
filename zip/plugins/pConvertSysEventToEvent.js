class ConvertedSystemEvent extends IEvent {
  constructor() {
    super();
    this.event = undefined;
    this.sysEventName = '';
    this.senderId = '';
    this.sysSenderObject = undefined;
  }
}

class pConvertSysEventToEvent extends IPlugin {
  static KEY_CFG_SYSEVENTNAME = 'SYSEVENTNAME';
  static KEY_CFG_SYSOBJECT = 'SYSOBJECT';
  static KEY_CFG_EVENTBUSEVENT = 'EVENTBUSEVENT';
  static KEY_CFG_EVENTBUSEVENTID = 'EVENTBUSEVENTID';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_SYSEVENTNAME = '';
    this.DEFAULT_KEY_CFG_SYSOBJECT = '';
    this.DEFAULT_KEY_CFG_EVENTBUSEVENT = '';
    this.DEFAULT_KEY_CFG_EVENTBUSEVENTID = '';
  }

  init() {
    const T = this.constructor;
    const TI = this;

    TI.cfgSYSEVENTNAME = TI.config[T.KEY_CFG_SYSEVENTNAME] || TI.DEFAULT_KEY_CFG_SYSEVENTNAME;
    TI.cfgSYSOBJECT = TI.config[T.KEY_CFG_SYSOBJECT] || TI.DEFAULT_KEY_CFG_SYSOBJECT;
    TI.cfgEVENTBUSEVENT = TI.config[T.KEY_CFG_EVENTBUSEVENT] || TI.DEFAULT_KEY_CFG_EVENTBUSEVENT;
    TI.cfgEVENTBUSEVENTID = TI.config[T.KEY_CFG_EVENTBUSEVENTID] || TI.DEFAULT_KEY_CFG_EVENTBUSEVENTID;

    TI.targetSysObject = SystemEventHandler.getTargetFromName(TI.cfgSYSOBJECT);

    TI.SEVT_EVT = new SystemEventHandler('', undefined, TI.targetSysObject, TI.cfgSYSEVENTNAME, this._fireEBEvent.bind(this));
    TI.SEVT_EVT.init();
    TI.catalogizeEventCall(this._fireEBEvent, TI.cfgEVENTBUSEVENT);
    TI.eventDefinitions.push([TI.cfgEVENTBUSEVENT, ConvertedSystemEvent, null]); // outside event handlers

    super.init();
  }

  deInit() {
    super.deInit();
  }

  _fireEBEvent(e) {
    const TI = this;

    sendEvent(TI.cfgEVENTBUSEVENT, (x) => {
      x.event = e;
      x.sysEventName = TI.cfgSYSEVENTNAME;
      x.id = TI.cfgEVENTBUSEVENTID;
      x.senderId = TI.aliasName;
      x.sysSenderObject = TI.targetSysObject;
    });
  }
}

Plugins.catalogize(pConvertSysEventToEvent);
