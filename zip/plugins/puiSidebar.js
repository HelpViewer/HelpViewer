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

  static toolbarButtonIdRoot = 'downP';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  static sidebar;

  static addition = '<div class="sidebar" id="sidebar" role="navigation"><div class="toolbar toolbar-down multi-linePanel" id="toolbar-down"></div></div>';

  _getSidebar() {
    return document.getElementById('sidebar');
  }

  init() {
    sendEvent(EventNames.ClickHandlerRegister, (y) => {
      y.handlerId = puiSidebar.toolbarButtonIdRoot;
      y.handler = puiSidebar._processClickedBottomPanelEvent;
    });

    const containerMain = document.getElementById('container');
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = puiSidebar.addition;
    const node = tmpDiv.firstChild;
    if (containerMain && node)
      containerMain.append(node);

    const sidebar = this._getSidebar();
    puiSidebar.sidebar = sidebar;
    const toolbar = document.getElementById('toolbar-down');

    var h_EVT_SIDE_PAGE_CREATE = (reply) => {
      if (!reply.pageId)
        return;
      
      const div = document.createElement('div');
      div.className = 'sidebar-page hidden';
      div.id = `sp-${reply.pageId}`;

      if (reply.role)
        div.setAttribute('role', reply.role);

      sidebar.prepend(div);
      reply.result = div;
    }
    puiSidebar.eventDefinitions.push([puiSidebar.EVT_SIDE_PAGE_CREATE, SidebarPageCreate, h_EVT_SIDE_PAGE_CREATE]);

    var h_EVT_SIDE_PAGE_SHOW = (reply) => {
      if (!reply.pageId)
        return;

      reply.result = puiSidebar.showSidebarTab(`sp-${reply.pageId}`);
    }
    puiSidebar.eventDefinitions.push([puiSidebar.EVT_SIDE_PAGE_SHOW, SidebarPageShow, h_EVT_SIDE_PAGE_SHOW]);

    var h_EVT_SIDE_TREEVIEW_CREATE = (reply) => {
      if (!reply.treeViewId || !reply.page)
        return;
      
      const obj = document.createElement('ul');
      obj.className = 'tree';
      obj.id = reply.treeViewId;

      reply.page.appendChild(obj);
      reply.result = obj;
    }
    puiSidebar.eventDefinitions.push([puiSidebar.EVT_SIDE_TREEVIEW_CREATE, TreeViewCreate, h_EVT_SIDE_TREEVIEW_CREATE]);

    var h_EVT_SIDE_VISIBILITY_SET = (reply) => {
      reply.result = toggleVisibility(sidebar, reply.value);
    }
    puiSidebar.eventDefinitions.push([puiSidebar.EVT_SIDE_VISIBILITY_SET, SidebarVisibilitySet, h_EVT_SIDE_VISIBILITY_SET]);

    this.subscribedButtonAccept = EventBus.sub(EventNames.ButtonSend, createButtonAcceptHandler(this, toolbar));

    window.addEventListener("resize", this._checkSidebarWidth);
    window.addEventListener("load", this._checkSidebarWidth);
    this._checkSidebarWidth();

    super.init();
  }

  deInit() {
    window.removeEventListener("resize", this._checkSidebarWidth);
    window.removeEventListener("load", this._checkSidebarWidth);
    this._getSidebar()?.remove();
    this.subscribedButtonAccept?.();
    super.deInit();
  }

  static _processClickedBottomPanelEvent(ev) {
    if (ev.elementIdRoot != puiSidebar.toolbarButtonIdRoot)
      return;

    ev.result = puiSidebar.showSidebarTab(`sp-${ev.elementId}`);
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
    const sidebar = puiSidebar.sidebar;
    if (!sidebar) return;
    if (sidebar.offsetWidth / window.innerWidth > 0.5) {
      sidebar.classList.add(C_TOOWIDE);
      contentPane.classList.add(C_TOOWIDE);
    } else {
      sidebar.classList.remove(C_TOOWIDE);
      contentPane.classList.remove(C_TOOWIDE);
    }
  }
}

Plugins.catalogize(puiSidebar);
