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
    const T = pui;
    const _processClickedEvent = (e) => {
      const foundExactEqual = this.btnHandlers.get(e.elementId);
      const foundRootEqual = this.btnHandlers.get(e.elementIdRoot);
      const found = foundExactEqual || foundRootEqual;

      if (found) {
        e.forwarded = foundExactEqual ? e.elementId : foundRootEqual ? e.elementIdRoot : false;
        log(`Event ${EventNames.ClickedEvent} (${e.eventId}, id: ${e.elementId}) forwarded by id: ${e.forwarded}`);
        found(e);
      } else {
        log(`E Event ${EventNames.ClickedEvent} (${e.eventId}, id: ${e.elementId}) cannot be forwarded by any of ids: ${e.elementId}, ${e.elementIdRoot}`);        
      }
    }
    this.subscribed = EventBus.sub(EventNames.ClickedEvent, _processClickedEvent);

    const h_EVT_CLICK_HANDLER_REGISTER = (reply) => {
      if (!reply.handlerId || !reply.handler)
        return;
      this.btnHandlers.set(reply.handlerId, reply.handler);
      reply.result = reply.handlerId;
    }
    T.eventDefinitions.push([T.EVT_CLICK_HANDLER_REGISTER, ClickHandlerRegister, h_EVT_CLICK_HANDLER_REGISTER]);

    const h_EVT_BUTTON_CREATE = (reply) => {
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
    T.eventDefinitions.push([T.EVT_BUTTON_CREATE, ButtonCreate, h_EVT_BUTTON_CREATE]);

    T.eventDefinitions.push([T.EVT_BUTTON_SEND, ButtonSend, null]); // outside event handlers

    super.init();
  }

  deInit() {
    this.btnHandlers.clear();
    this.subscribed?.();

    super.deInit();
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

function registerOnClick(handlerId, handler) {
  return sendEvent(pui.EVT_CLICK_HANDLER_REGISTER, (d) => {
    d.handlerId = handlerId;
    d.handler = handler;
  });
}
