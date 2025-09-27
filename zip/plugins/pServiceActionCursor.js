class SetActionCursor extends IEvent {
  constructor() {
    super();
    this.cursorAddition = '';
    this.convertedEventId = '';
    this.offsetLT = [0, 8];
    this.handler = undefined;
  }
}

class ActionClickedEvent extends ClickedEvent {
  constructor() {
    super();
    this.senderId = '';
  }
}

class pServiceActionCursor extends pClickConverter {
  static EVT_AC_SET = SetActionCursor.name;
  static EVT_AC_STOP = 'StopActionCursor';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_SYSOBJECT = 'document';
    this.DEFAULT_KEY_CFG_EVENTBUSEVENT = 'ActionClickedEvent';

    this.eventIdStrict = true;
  }

  init() {
    const T = this.constructor;
    const TI = this;

    ActionClickedEvent.register(TI.cfgEVENTBUSEVENT);

    const h_EVT_AC_SET = (data) => {
      TI.targetSysObject = SystemEventHandler.getTargetFromName(TI.cfgSYSOBJECT);
      TI.SEVT_MOUSE = new SystemEventHandler('', undefined, TI.targetSysObject, 'mousemove', this._mouseMove.bind(this));
      TI.SEVT_MOUSE.init();

      TI.cursorAddon = document.createElement('span');
      TI.cursorAddon.id = 'span-' + newUID();
      TI.cursorAddon.classList.add('cursorAddon');
      TI.cursorAddon.innerHTML = data.cursorAddition;
      TI.activeEvent = data;
      TI.config['EVENTBUSEVENTID'] = data.convertedEventId;
  
      document.body.append(TI.cursorAddon);
    }
    TI.eventDefinitions.push([T.EVT_AC_SET, SetActionCursor, h_EVT_AC_SET]);

    const h_EVT_AC_STOP = (data) => this._disposeAll();
    TI.eventDefinitions.push([T.EVT_AC_STOP, IEvent, h_EVT_AC_STOP]);

    super.init();
  }

  _mouseMove(e) {
    if (!this.cursorAddon)
      return;
    
    const offset = this.activeEvent.offsetLT;

    this.cursorAddon.style.left = e.pageX + offset[0] + 'px';
    this.cursorAddon.style.top  = e.pageY + offset[1] + 'px';
  }

  _fireEBEvent(e) {
    if (this.activeEvent) {
      if (!this.activeEvent.handler) {
      super._fireEBEvent(e);
      } else {
        const x = getEventInput(this.cfgEVENTBUSEVENT);
        this._fillMinimum(x, e);
        this.resolvedFillEventObject(x, e);
        this.activeEvent.handler(x);
      }
    }
  }

  _fillEventObject(x, e) {
    super._fillEventObject(x, e);
    x.id = this.activeEvent.convertedEventId;
    x.senderId = this.aliasName;
  }

  deInit() {
    this._disposeAll();
    super.deInit();
  }

  _disposeAll() {
    const TI = this;
    TI.activeEvent = undefined;
    TI.cursorAddon?.remove();
    TI.cursorAddon = undefined;
    TI.SEVT_MOUSE?.deInit();
    TI.SEVT_MOUSE = undefined;
  }
}

Plugins.catalogize(pServiceActionCursor);
