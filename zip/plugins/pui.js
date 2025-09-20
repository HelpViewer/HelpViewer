class ButtonCreate extends IEvent {
  constructor() {
    super();
    this.buttonId = '';
    this.caption = '';
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

class ElementSetVisibility extends IEvent {
  constructor() {
    super();
    this.value = false;
    this.elementId = '';
    this.element = undefined;
  }
}

class pui extends IPlugin {
  static EVT_BUTTON_CREATE = ButtonCreate.name;
  static EVT_CLICK_HANDLER_REGISTER = ClickHandlerRegister.name;
  static EVT_BUTTON_SEND = ButtonSend.name;
  static EVT_ELEMENT_SET_VISIBILITY = ElementSetVisibility.name;

  constructor(aliasName, data) {
    super(aliasName, data);
    this.routing = new Map();
  }

  init() {
    const T = this.constructor;
    const TI = this;

    const h_EVT_CLICK_HANDLER_REGISTER = (reply) => {
      if (!reply.handlerId || !reply.handler)
        return;
      this.routing.set(reply.handlerId, reply.handler);
      reply.result = reply.handlerId;
    }
    TI.eventDefinitions.push([T.EVT_CLICK_HANDLER_REGISTER, ClickHandlerRegister, h_EVT_CLICK_HANDLER_REGISTER]);

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
    TI.eventDefinitions.push([T.EVT_BUTTON_CREATE, ButtonCreate, h_EVT_BUTTON_CREATE]);

    const h_EVT_ELEMENT_SET_VISIBILITY = (reply) => {
      const button = $(reply.elementId);
      if (!button) 
        return;

      reply.element = button;
      reply.result = toggleVisibility(button, reply.value);
    }
    TI.eventDefinitions.push([T.EVT_ELEMENT_SET_VISIBILITY, ElementSetVisibility, h_EVT_ELEMENT_SET_VISIBILITY]);

    TI.eventDefinitions.push([T.EVT_BUTTON_SEND, ButtonSend, null]); // outside event handlers

    TI.catalogizeEventCall(TI.onET_ClickedEvent, EventNames.ClickedEventNotForwarded);
    super.init();
  }

  deInit() {
    this.routing.clear();

    super.deInit();
  }

  onET_ClickedEvent(e) {
    const foundExactEqual = this.routing.get(e.elementId);
    const foundRootEqual = this.routing.get(e.elementIdRoot);
    const found = foundExactEqual || foundRootEqual;

    if (found) {
      e.forwarded = foundExactEqual ? e.elementId : foundRootEqual ? e.elementIdRoot : false;
      log(`Event ${EventNames.ClickedEvent} (${e.eventId}, id: ${e.elementId}) forwarded by id: ${e.forwarded}`);
      found(e);
    } else {
      log(`E Event ${EventNames.ClickedEvent} (${e.eventId}, id: ${e.elementId}) cannot be forwarded by any of ids: ${e.elementId}, ${e.elementIdRoot}`);
      _notifyClickedEvent(e, undefined, undefined, ClickedEventNotForwarded.name);
    }
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

class puiButton extends IPlugin {
  static KEY_CFG_ID = 'ID';
  static KEY_CFG_CAPTION = 'CAPTION';
  static KEY_CFG_TARGET = 'TARGET';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.button = undefined;

    this.DEFAULT_KEY_CFG_ID = this.DEFAULT_KEY_CFG_ID || 'downP-X';
    this.DEFAULT_KEY_CFG_CAPTION = this.DEFAULT_KEY_CFG_CAPTION || 'X';
    this.DEFAULT_KEY_CFG_TARGET = this.DEFAULT_KEY_CFG_TARGET || UI_PLUGIN_SIDEBAR;
  }

  init(handler = null) {
    const T = this.constructor;
    const TI = this;
    this.cfgId = this.config[T.KEY_CFG_ID] || TI.DEFAULT_KEY_CFG_ID;
    this.cfgCaption = this.config[T.KEY_CFG_CAPTION] || TI.DEFAULT_KEY_CFG_CAPTION;
    this.cfgTarget = this.config[T.KEY_CFG_TARGET] || TI.DEFAULT_KEY_CFG_TARGET;

    const handlerResolved = handler ? handler : (evt) => this._buttonAction(evt);
    this.button = uiAddButton(this.cfgId, this.cfgCaption, this.cfgTarget, handlerResolved);

    TI.catalogizeEventCall(TI.init, EventNames.ButtonCreate);
    TI.catalogizeEventCall(TI.init, EventNames.ButtonSend);

    super.init();
  }

  deInit() {
    this.button?.remove();

    super.deInit();
  }

  _buttonAction(evt) {
    log('W puiButton._buttonAction must be overriden in ' + this.constructor.name);
  }
}

class ClickedEventNotForwarded extends ClickedEvent {
  constructor() {
    super();
    this.treeId = undefined;
  }
}

function _notifyClickedEvent(e, result, cfgTreeId, eventName = 'ClickedEventTree') {
  return sendEvent(eventName, (dc) => {
    const bkpCreatedAt = dc.createdAt;
    const bkpEventId = dc.eventId;
    //const bkpParentEventId = dc.parentEventId;
    const bkpEventName = dc.eventName;

    Object.assign(dc, e);

    dc.createdAt = bkpCreatedAt;
    dc.eventId = bkpEventId;
    dc.parentEventId = e.eventId;
    dc.eventName = bkpEventName;

    dc.result = result;
    dc.treeId = cfgTreeId;
  });
}

Plugins.catalogize(puiButton);
