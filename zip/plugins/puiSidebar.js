var C_TOOWIDE = 'too-wide';

class SidebarPageCreate extends IEvent {
  constructor() {
    super();
    this.pageId = '';
    this.role = '';
  }
}

class TreeViewCreate extends IEvent {
  constructor() {
    super();
    this.page = undefined;
    this.treeViewId = '';
  }
}

class SidebarPageShow extends IEvent {
  constructor() {
    super();
    this.pageId = '';
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
    this.eventIdStrict = true;
  }

  static addition = '<div class="sidebar" id="sidebar" role="navigation"><div class="toolbar toolbar-down multi-linePanel" id="toolbar-down"></div></div>';
  static cssClassSideBarPage = 'sidebar-page';

  prigetSidebar() {
    return $('sidebar');
  }

  init() {
    const T = this.constructor;
    const TI = this;
    sendEvent(EventNames.ClickHandlerRegister, (y) => {
      y.handlerId = T.toolbarButtonIdRoot;
      y.handler = T._processClickedBottomPanelEvent;
    });

    const containerMain = $('container');
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = T.addition;
    const node = tmpDiv.firstChild;
    if (containerMain && node)
      containerMain.append(node);

    const sidebar = TI.prigetSidebar();
    this.sidebar = sidebar;
    const toolbar = $('toolbar-down');

    const h_EVT_SIDE_PAGE_CREATE = (reply) => {
      if (!reply.pageId)
        return;
      
      const div = document.createElement('div');
      div.className = T.cssClassSideBarPage + ' hidden';
      div.id = `sp-${reply.pageId}`;

      if (reply.role)
        div.setAttribute('role', reply.role);

      sidebar.insertBefore(div, toolbar);
      reply.result = div;
    }
    TI.eventDefinitions.push([T.EVT_SIDE_PAGE_CREATE, SidebarPageCreate, h_EVT_SIDE_PAGE_CREATE]);

    const h_EVT_SIDE_PAGE_SHOW = (reply) => {
      if (!reply.pageId)
      {
        const found = T._getVisibleButtonsList(toolbar)[0];
        
        if (!found)
          return;

        reply.pageId = found.id;
        found.click();
      }

      reply.result = T.showSidebarTab(`sp-${reply.pageId}`);
    }
    TI.eventDefinitions.push([T.EVT_SIDE_PAGE_SHOW, SidebarPageShow, h_EVT_SIDE_PAGE_SHOW]);

    const h_EVT_SIDE_TREEVIEW_CREATE = (reply) => {
      if (!reply.treeViewId || !reply.page)
        return;
      
      const obj = document.createElement('ul');
      obj.className = 'tree';
      obj.id = reply.treeViewId;

      reply.page.appendChild(obj);
      reply.result = obj;
    }
    TI.eventDefinitions.push([T.EVT_SIDE_TREEVIEW_CREATE, TreeViewCreate, h_EVT_SIDE_TREEVIEW_CREATE]);

    const h_EVT_SIDE_VISIBILITY_SET = (reply) => {
      reply.result = toggleVisibility(sidebar, reply.value);

      if (reply.result) {
        sidebar.style.display = 'flex';
        requestAnimationFrame(() => sidebar.style.opacity = '1');
      } else {
        sidebar.style.opacity = '0';
        setTimeout(() => sidebar.style.display = 'none', 500);
      }
    }
    TI.eventDefinitions.push([T.EVT_SIDE_VISIBILITY_SET, SidebarVisibilitySet, h_EVT_SIDE_VISIBILITY_SET]);

    const h_EVT_SIDE_SIDE_TOGGLE = (reply) => {
      const C_TORIGHT = 'toright';
      reply.result = !toggleCSSClass(sidebar?.parentElement, C_TORIGHT);
    }
    TI.eventDefinitions.push([T.EVT_SIDE_SIDE_TOGGLE, IEvent, h_EVT_SIDE_SIDE_TOGGLE]);
    
    const baseButtonAccept = createButtonAcceptHandler(TI, toolbar);
    this.h_buttonAccept = (reply) =>
    {
      baseButtonAccept(reply);
      T.recomputeButtonPanel(reply.button);
    }

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
    super.deInit();
  }

  onETButtonSend(x) {
    this.h_buttonAccept(x);
  }

  onET_ElementSetVisibility(x) {
    const T = this.constructor;
    T.recomputeButtonPanel(x.element);
    var visibleTabs = T._getVisibleButtonsList(sidebar);
    visibleTabs = Array.from(visibleTabs).filter(el => el.classList.contains(T.cssClassSideBarPage));
    if (!visibleTabs || visibleTabs.length != 1)
      showSidebarTab();
  }

  static _getVisibleButtonsList(panel) {
    return $A(`:scope > :not(.${C_HIDDENC})`, panel);
  }

  static recomputeButtonPanel(button)
  {
    if (!button) return;
    
    const multilineCSS = 'multi-linePanel';
    const panel = button.parentElement;
    const len = this._getVisibleButtonsList(panel).length;
  
    if (len <= 9) {
      panel.classList.remove(multilineCSS);
    } else {
      panel.classList.add(multilineCSS);
    }
  }

  static _processClickedBottomPanelEvent(ev) {
    const T = this.constructor;
    if (ev.elementIdRoot != T.toolbarButtonIdRoot)
      return;

    ev.result = T.showSidebarTab(`sp-${ev.elementId}`);

    if (!ev.result)
      log(`W Tab [sp-${ev.elementId}] not found on sidebar! Event id: ${ev.eventId}`);
    
    ev.stop = true;
  }

  /*S: Feature: Sidebar tabs handling */
  static showSidebarTab(id) {
    const tab = $(id);
    
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
    const contentPane = $('content');
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
