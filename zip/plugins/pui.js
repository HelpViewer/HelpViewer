class ButtonCreate extends IEvent {
  constructor() {
    super();
    this.buttonId = undefined;
    this.caption = undefined;
    this.handler = undefined;
  }
}

class ClickHandlerRegister extends IEvent {
  constructor() {
    super();
    this.handlerId = undefined;
    this.handler = undefined;
  }
}

class ButtonSend extends IEvent {
  constructor() {
    super();
    this.button = undefined;
    this.id = undefined;
  }
}

const UI_PLUGIN_SIDEBAR = 'sidebar';
const UI_PLUGIN_HEADER = 'header';

class pui extends IPlugin {
  static EVT_BUTTON_CREATE = ButtonCreate.name;
  static EVT_CLICK_HANDLER_REGISTER = ClickHandlerRegister.name;
  static EVT_BUTTON_SEND = ButtonSend.name;

  constructor(aliasName, data) {
    super(aliasName, data);
    this.btnHandlers = new Map();
  }

  static eventDefinitions = [];

  init() {
    this.subscribed = EventBus.sub(EventNames.ClickedEvent, this._processClickedEvent.bind(this));

    var h_EVT_CLICK_HANDLER_REGISTER = (reply) => {
      if (!reply.handlerId || !reply.handler)
        return;
      this.btnHandlers.set(reply.handlerId, reply.handler);
      reply.result = reply.handlerId;
    }
    pui.eventDefinitions.push([pui.EVT_CLICK_HANDLER_REGISTER, ClickHandlerRegister, h_EVT_CLICK_HANDLER_REGISTER]);

    var h_EVT_BUTTON_CREATE = (reply) => {
      if (!reply.buttonId)
        return;
      
      const button = document.createElement('button');
      button.className = 'pnl-btn';
      button.id = reply.buttonId;
      button.textContent = reply.caption;

      if (reply.handler)
        h_EVT_CLICK_HANDLER_REGISTER({ handlerId: reply.buttonId, handler: reply.handler});

      reply.result = button;
    }
    pui.eventDefinitions.push([pui.EVT_BUTTON_CREATE, ButtonCreate, h_EVT_BUTTON_CREATE]);

    pui.eventDefinitions.push([pui.EVT_BUTTON_SEND, ButtonSend, null]); // outside event handlers

    super.init();
  }

  deInit() {
    this.btnHandlers.clear();
    this.subscribed?.();

    super.deInit();
  }

  _processClickedEvent(e) {
    (this.btnHandlers.get(e.elementId) || this.btnHandlers.get(e.elementIdRoot))?.(e);
  }
}

Plugins.catalogize(pui);

function createButtonAcceptHandler(pluginInstance, toolbar) {
  return function(reply) {
    if (!reply || reply.id !== pluginInstance.aliasName || !reply.button)
      return;
    toolbar?.appendChild(reply.button);
    reply.result = true;
  };
}
