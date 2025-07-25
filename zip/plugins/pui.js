class ButtonCreate extends IEvent {
  constructor() {
    super();
    this.buttonId = undefined;
    this.caption = undefined;
    this.handler = undefined;
  }
}

class pui extends IPlugin {
  static EVT_BUTTON_CREATE = ButtonCreate.name;

  constructor(aliasName, data) {
    super(aliasName, data);
    this.btnHandlers = new Map();
  }

  static eventDefinitions = [];

  init() {
    EventBus.sub(EventNames.ClickedEvent, this._processClickedEvent);

    var h_EVT_BUTTON_CREATE = (reply) => {
      if (!reply.buttonId)
        return;
      
      const button = document.createElement('button');
      button.className = 'pnl-btn';
      button.id = reply.buttonId;
      button.textContent = reply.caption;

      if (reply.handler) {
        this.btnHandlers.set(reply.buttonId, reply.handler);
      }

      reply.result = button;
    }
    pui.eventDefinitions.push([pui.EVT_BUTTON_CREATE, ButtonCreate, h_EVT_BUTTON_CREATE]);

    super.init();
  }

  deInit() {
    this.btnHandlers = undefined;

    super.deInit();
  }

  _processClickedEvent(e) {
    this.btnHandlers.get(e.elementId)?.(e);
  }
}

Plugins.catalogize(pui);