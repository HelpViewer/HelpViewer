
class ClickedEvent extends IEvent {
  constructor() {
    super();
    this.elementId = null;
    this.elementIdRoot = null;
    this.elementIdVal = null;
    this.target = null;
    this.event = null;
  }
}

class pClickDispatcher extends IPlugin {
  static EVT_CD_CLICK = ClickedEvent.name;

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  init() {
    pClickDispatcher.eventDefinitions.push([pClickDispatcher.EVT_CD_CLICK, ClickedEvent, null]); // outside event handlers

    document.body.addEventListener('click', this._processClick);

    super.init();
  }
  
  _processClick(evt) {
    sendEvent(pClickDispatcher.EVT_CD_CLICK, (d) => {
      d.event = evt;
      d.target = d.event?.target;
      d.elementId = d.target?.id
      const splits = d.elementId?.split('|') ?? [];
      d.elementIdRoot = splits[0];
      d.elementIdVal = splits[1];
    });
  }

  deInit() {
    super.deInit();

    document.body.removeEventListener('click', this._processClick);
  }
}

Plugins.catalogize(pClickDispatcher);
