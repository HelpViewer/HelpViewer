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

class ElementSetVisibility extends IEvent {
  constructor() {
    super();
    this.value = undefined;
    this.elementId = undefined;
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
    this.btnHandlers = new Map();
  }

  static eventDefinitions = [];

  init() {
    const T = this.constructor;
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

    const h_EVT_ELEMENT_SET_VISIBILITY = (reply) => {
      const button = document.getElementById(reply.elementId);
      if (!button) 
        return;

      reply.element = button;
      reply.result = toggleVisibility(button, reply.value);
    }
    T.eventDefinitions.push([T.EVT_ELEMENT_SET_VISIBILITY, ElementSetVisibility, h_EVT_ELEMENT_SET_VISIBILITY]);

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

class puiButton extends IPlugin {
  static eventDefinitions = [];

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

class puiButtonTab extends puiButton {
  static eventDefinitions = [];

  constructor(aliasName, data) {
    super(aliasName, data);
    this.tab = undefined;
  }

  init() {
    super.init(H_BUTTON_WITH_TAB);
    const TI = this;
    TI.tab = TI.button[1];
    TI.button = TI.button[0];
    registerOnClick(TI.button.id, (evt) => TI._buttonAction(evt));
  }

  deInit() {
    this.tab?.remove();

    super.deInit();
  }

  _preShowAction(evt) {
    log('W puiButtonTab._preShowAction must be overriden in ' + this.constructor.name);
  }

  _buttonAction(evt) {
    this._preShowAction(evt);
    showSidebarTab(this.tab?.id);
  }
}

class SetTreeData extends IEvent {
  constructor() {
    super();
    this.data = undefined;
    this.targetTree = undefined;
    this.append = false;
  }
}

class puiButtonTabTree extends puiButtonTab {
  static EVT_SET_TREE_DATA = SetTreeData.name;
  static EVT_TREE_DATA_CHANGED = 'TreeDataChanged';

  static eventDefinitions = [];

  static KEY_CFG_TREEID = 'TREEID';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.tree = undefined;

    this.DEFAULT_KEY_CFG_TREEID = 'tree';
    this.eventIdStrict = true;
  }

  init() {
    const TI = this;
    const T = this.constructor;

    const h_EVT_SET_TREE_DATA = (data) => {
      if (data.id != this.aliasName)
        return;

      if (!data.append)
        tree.textContent = '';

      tree.insertAdjacentHTML('beforeend', linesToHtmlTree(data.data, this.cfgTreeId));

      data.targetTree = this.cfgTreeId;
      data.result = this.aliasName;

      sendEvent(T.EVT_TREE_DATA_CHANGED, (dc) => {
        dc.data = data.data;
        dc.targetTree = data.targetTree;
        dc.append = data.append;
      });
    };
    T.eventDefinitions.push([T.EVT_SET_TREE_DATA, SetTreeData, h_EVT_SET_TREE_DATA]);
    T.eventDefinitions.push([T.EVT_TREE_DATA_CHANGED, SetTreeData, null]); // outside event handlers

    super.init();
    this.cfgTreeId = this.config[T.KEY_CFG_TREEID] || TI.DEFAULT_KEY_CFG_TREEID;
    TI._preStandardInit();

    this.tree = uiAddTreeView(TI.cfgTreeId, TI.tab);

    registerOnClick(TI.cfgTreeId, (e) => this._treeClick(e));
  }

  deInit() {
    super.deInit();
  }

  _preStandardInit() {
  }

  _treeClick(e) {
  }
}
