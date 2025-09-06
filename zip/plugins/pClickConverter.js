
class ClickedEvent extends IEvent {
  constructor() {
    super();
    this.elementId = null;
    this.elementIdRoot = null;
    this.elementIdVal = null;
    this.target = null;
    this.event = null;
    this.forwarded = false;
  }
}

class pClickConverter extends IPlugin {
  static EVT_CD_CLICK = ClickedEvent.name;

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    const T = this.constructor;
    const TI = this;
    TI.eventDefinitions.push([T.EVT_CD_CLICK, ClickedEvent, null]); // outside event handlers

    TI.catalogizeEventCall(TI._processClick, T.EVT_CD_CLICK);

    TI.SEVT_CLICK = new SystemEventHandler('', undefined, document.body, 'click', this._processClick);
    TI.SEVT_CLICK.init();
    
    super.init();
  }
  
  _processClick(evt) {
    sendEvent(pClickConverter.EVT_CD_CLICK, (d) => {
      d.event = evt;
      d.target = d.event?.target;
      d.elementId = d.target?.id
      const splits = d.elementId?.replace('-', '|').split('|').filter(Boolean) ?? [];
      d.elementIdRoot = splits[0];
      d.elementIdVal = splits[1];
    });
  }

  deInit() {
    super.deInit();
  }
}

Plugins.catalogize(pClickConverter);
