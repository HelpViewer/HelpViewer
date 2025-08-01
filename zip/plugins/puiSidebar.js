const C_TOOWIDE = 'too-wide';

class SidebarPageCreate extends IEvent {
  constructor() {
    super();
    this.pageId = undefined;
    this.role = undefined;
  }
}

class TreeViewCreate extends IEvent {
  constructor() {
    super();
    this.page = undefined;
    this.treeViewId = undefined;
  }
}

class SidebarPageShow extends IEvent {
  constructor() {
    super();
    this.pageId = undefined;
  }
}

class SidebarVisibilitySet extends IEvent {
  constructor() {
    super();
    this.value = undefined;
  }
}

class puiSidebar extends IPlugin {
  static EVT_SIDE_PAGE_CREATE = SidebarPageCreate.name;
  static EVT_SIDE_PAGE_SHOW = SidebarPageShow.name;
  static EVT_SIDE_TREEVIEW_CREATE = TreeViewCreate.name;
  static EVT_SIDE_VISIBILITY_SET = SidebarVisibilitySet.name;
  static EVT_SIDE_SIDE_TOGGLE = 'EVT_SIDE_SIDE_TOGGLE';

  static toolbarButtonIdRoot = 'downP';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.handler_checkSidebarWidth = (evt) => this._checkSidebarWidth();
    this.contentPane = document.getElementById('content');
  }

  static eventDefinitions = [];

  static addition = '<div class="sidebar" id="sidebar" role="navigation"><div class="toolbar toolbar-down multi-linePanel" id="toolbar-down"></div></div>';

  prigetSidebar() {
    return document.getElementById('sidebar');
  }

  init() {
    const T = puiSidebar;
    const TI = this;
    sendEvent(EventNames.ClickHandlerRegister, (y) => {
      y.handlerId = T.toolbarButtonIdRoot;
      y.handler = T._processClickedBottomPanelEvent;
    });

    const containerMain = document.getElementById('container');
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = T.addition;
    const node = tmpDiv.firstChild;
    if (containerMain && node)
      containerMain.append(node);

    const sidebar = TI.prigetSidebar();
    const toolbar = document.getElementById('toolbar-down');

    const h_EVT_SIDE_PAGE_CREATE = (reply) => {
      if (!reply.pageId)
        return;
      
      const div = document.createElement('div');
      div.className = 'sidebar-page hidden';
      div.id = `sp-${reply.pageId}`;

      if (reply.role)
        div.setAttribute('role', reply.role);

      sidebar.insertBefore(div, toolbar);
      reply.result = div;
    }
    T.eventDefinitions.push([T.EVT_SIDE_PAGE_CREATE, SidebarPageCreate, h_EVT_SIDE_PAGE_CREATE]);

    const h_EVT_SIDE_PAGE_SHOW = (reply) => {
      if (!reply.pageId)
        return;

      reply.result = T.showSidebarTab(`sp-${reply.pageId}`);
    }
    T.eventDefinitions.push([T.EVT_SIDE_PAGE_SHOW, SidebarPageShow, h_EVT_SIDE_PAGE_SHOW]);

    const h_EVT_SIDE_TREEVIEW_CREATE = (reply) => {
      if (!reply.treeViewId || !reply.page)
        return;
      
      const obj = document.createElement('ul');
      obj.className = 'tree';
      obj.id = reply.treeViewId;

      reply.page.appendChild(obj);
      reply.result = obj;
    }
    T.eventDefinitions.push([T.EVT_SIDE_TREEVIEW_CREATE, TreeViewCreate, h_EVT_SIDE_TREEVIEW_CREATE]);

    const h_EVT_SIDE_VISIBILITY_SET = (reply) => {
      reply.result = toggleVisibility(sidebar, reply.value);
    }
    T.eventDefinitions.push([T.EVT_SIDE_VISIBILITY_SET, SidebarVisibilitySet, h_EVT_SIDE_VISIBILITY_SET]);

    const h_EVT_SIDE_SIDE_TOGGLE = (reply) => {
      const C_TORIGHT = 'toright';
      reply.result = !toggleCSSClass(sidebar?.parentElement, C_TORIGHT);
    }
    T.eventDefinitions.push([T.EVT_SIDE_SIDE_TOGGLE, IEvent, h_EVT_SIDE_SIDE_TOGGLE]);
    
    const baseButtonAccept = createButtonAcceptHandler(TI, toolbar);
    const h_buttonAccept = (reply) =>
    {
      baseButtonAccept(reply);
      T.recomputeButtonPanel(reply.button);
    }
    TI.subscribedButtonAccept = EventBus.sub(EventNames.ButtonSend, h_buttonAccept);

    EventBus.sub(EventNames.ElementSetVisibility, (x) => T.recomputeButtonPanel(x.element));

    window.addEventListener("resize", this.handler_checkSidebarWidth);
    window.addEventListener("load", this.handler_checkSidebarWidth);
    TI._checkSidebarWidth();

    super.init();
    //this.eventIdStrict = true;
  }

  deInit() {
    window.removeEventListener("resize", this.handler_checkSidebarWidth);
    window.removeEventListener("load", this.handler_checkSidebarWidth);
    this.prigetSidebar()?.remove();
    this.subscribedButtonAccept?.();
    super.deInit();
  }

  static recomputeButtonPanel(button)
  {
    if (!button) return;
    
    const multilineCSS = 'multi-linePanel';
    const panel = button.parentElement;
    const len = panel.querySelectorAll(`:scope > :not(.${C_HIDDENC})`).length;
  
    if (len <= 9) {
      panel.classList.remove(multilineCSS);
    } else {
      panel.classList.add(multilineCSS);
    }
  }

  static _processClickedBottomPanelEvent(ev) {
    const T = puiSidebar;
    if (ev.elementIdRoot != T.toolbarButtonIdRoot)
      return;

    ev.result = T.showSidebarTab(`sp-${ev.elementId}`);

    if (!ev.result)
      log(`W Tab [sp-${ev.elementId}] not found on sidebar! Event id: ${ev.eventId}`);
    
    ev.stop = true;
  }

  /*S: Feature: Sidebar tabs handling */
  static showSidebarTab(id) {
    const tab = document.getElementById(id);
    
    if (tab) {
      Array.from(tab.parentElement.children).forEach(child => {
        child.classList.add(C_HIDDENC);
      });
    
      tab.classList.remove(C_HIDDENC);
      return tab;
    }
  }
  /*E: Feature: Sidebar tabs handling */

  _checkSidebarWidth() {
    const sidebar = this.prigetSidebar();
    if (!sidebar) return;
    if (sidebar.offsetWidth / window.innerWidth > 0.5) {
      sidebar.classList.add(C_TOOWIDE);
      this.contentPane.classList.add(C_TOOWIDE);
    } else {
      sidebar.classList.remove(C_TOOWIDE);
      this.contentPane.classList.remove(C_TOOWIDE);
    }
  }
}

Plugins.catalogize(puiSidebar);
