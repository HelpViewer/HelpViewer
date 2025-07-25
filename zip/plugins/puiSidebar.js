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

class puiSidebar extends IPlugin {
  static EVT_SIDE_PAGE_CREATE = SidebarPageCreate.name;
  static EVT_SIDE_TREEVIEW_CREATE = TreeViewCreate.name;

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  static addition = '<div class="sidebar" id="sidebar" role="navigation"><div class="toolbar toolbar-down multi-linePanel" id="toolbar-down"></div></div>';

  _getSidebar() {
    return document.getElementById('sidebar');
  }

  init() {
    const containerMain = document.getElementById('container');
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = puiSidebar.addition;
    const node = tmpDiv.firstChild;
    if (containerMain && node)
      containerMain.append(node);

    const sidebar = this._getSidebar();
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

    this.subscribedButtonAccept = EventBus.sub(EventNames.ButtonSend, createButtonAcceptHandler(this, toolbar));

    super.init();
  }

  deInit() {
    this._getSidebar()?.remove();
    this.subscribedButtonAccept?.();
    super.deInit();
  }
}

Plugins.catalogize(puiSidebar);
