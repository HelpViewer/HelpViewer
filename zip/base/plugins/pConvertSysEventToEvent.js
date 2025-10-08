class ConvertedSystemEvent extends IEvent {
  constructor() {
    super();
    this.event = undefined;
    this.sysEventName = '';
    this.senderId = '';
    this.sysSenderObject = undefined;
  }
}

ConvertedSystemEvent.register();

class pConvertSysEventToEvent extends IPlugin {
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

    TI.targetSysObject = SystemEventHandler.getTargetFromName(TI.cfgSYSOBJECT);

    TI.SEVT_EVT = new SystemEventHandler('', undefined, TI.targetSysObject, TI.cfgSYSEVENTNAME, this._fireEBEvent.bind(this));
    TI.SEVT_EVT.init();
    TI.catalogizeEventCall(this._fireEBEvent, TI.cfgEVENTBUSEVENT);
    TI._eventDescriptor = IEvent.eventObjects.get(this.cfgEVENTBUSEVENT);
    TI.eventDefinitions.push([TI.cfgEVENTBUSEVENT, TI._getEBEventClass(), null]); // outside event handlers

    TI.resolvedFillEventObject = this._eventDescriptor?.[1] || this._fillEventObject;

    super.init();
  }
  
  _getEBEventClass() {
    const reply = this._eventDescriptor?.[0] || ConvertedSystemEvent;
    return reply;
  }

  _fireEBEvent(e) {
    sendEvent(this.cfgEVENTBUSEVENT, (x) => {
      this._fillMinimum(x, e);
      this.resolvedFillEventObject(x, e);
    });
  }

  _fillEventObject(x, e) {
    const TI = this;
    x.event = e;
    x.sysEventName = TI.cfgSYSEVENTNAME;
    x.senderId = TI.aliasName;
    x.sysSenderObject = TI.targetSysObject;
  }

  _fillMinimum(x, e) {
    const TI = this;
    x.id = TI.cfgEVENTBUSEVENTID;
  }
}

Plugins.catalogize(pConvertSysEventToEvent);
