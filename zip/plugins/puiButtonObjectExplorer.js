class puiButtonObjectExplorer extends puiButtonTabTree {
  static KEY_CFG_GROUPSLIST = 'GROUPSLIST';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ObjectExplorer';
    this.DEFAULT_KEY_CFG_CAPTION = '🧩';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_TREEID = 'objectList';

    this.DEFAULT_KEY_CFG_GROUPSLIST = '';
  }

  init() {
    super.init();
    hideButton(this.button.id, false);

    const T = this.constructor;
    const TI = this;
    this.cfgGroupsList = (this.config[T.KEY_CFG_GROUPSLIST] || TI.DEFAULT_KEY_CFG_GROUPSLIST).split(';');
  }

  deInit() {
    super.deInit();
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, true);
  }

  _preShowAction(evt) {
    const plugins = getPluginsState();

    // preparation of flat lists
    this.treeData = [];
    const pluginGroups = this.cfgGroupsList.map(x => new ObjectExplorerTreeItem(x, new ObjectExplorerObjectDescriptor('grp', this.config[x], true), [], undefined, _T(x), [this.config[`${x}-F`].split(';')]));
    var pluginNodes = plugins[0].map(x => new ObjectExplorerTreeItem(x, ObjectExplorerObjectDescriptor.PLUGIN, [], ));
    var pluginInstanceNodes = plugins[2].map(x => new ObjectExplorerTreeItem(x[0], ObjectExplorerObjectDescriptor.PLUGININSTANCE, [], x[1]));

    // plugin instances data reading
    pluginInstanceNodes.forEach(plug => {
      const plg = plug.interconnectedObject;
      var proto = Object.getPrototypeOf(plg);

      const prefixEventHandler = /^onET/;
      Object.getOwnPropertyNames(proto).filter(name => prefixEventHandler.test(name)).forEach(name => {
        browseMember(proto, name, (desc) => {
          if (typeof desc.value !== 'function') return;
          var nameBase = name.replace(prefixEventHandler, '');
          plug.subItems.push(new ObjectExplorerTreeItem(name, ObjectExplorerObjectDescriptor.HANDLER, [], undefined, nameBase));
        });
      });

      plg.eventDefinitions.forEach(evt => {
        plug.subItems.push(new ObjectExplorerTreeItem(evt[0], 
          evt[2] ? ObjectExplorerObjectDescriptor.EVENT : ObjectExplorerObjectDescriptor.EVENT_NOHANDLER, 
          [], undefined, undefined, 
          [evt[2] ? ObjectExplorerTreeItem.F_EVENT_WHANDLER : ObjectExplorerTreeItem.F_EVENT_NOHANDLER]
        ));
      });

      var prefixCFG = /^KEY_CFG_/;
      var proto = plg.constructor;
      const cfgKeysProps = [];
      const getCfgVarsFromObject = (proto, prefixCFG, getNameBase = (d) => d.value) => Object.getOwnPropertyNames(proto).filter(name => prefixCFG.test(name)).forEach(name => {
        browseMember(proto, name, (desc) => {
          var nameBase = getNameBase(desc);
          if (!cfgKeysProps.includes(nameBase)) {
            plug.subItems.push(new ObjectExplorerTreeItem(name, ObjectExplorerObjectDescriptor.CONFIG, [], undefined, nameBase));
            cfgKeysProps.push(nameBase);
          }
        });
      });

      getCfgVarsFromObject(proto, prefixCFG);

      var cfgKeysCfgState = [...Object.keys(plg.config).filter(x => !cfgKeysProps.includes(x))].filter(x => x);
      cfgKeysCfgState.forEach(name => {
        if (!cfgKeysProps.includes(name)) {
          plug.subItems.push(new ObjectExplorerTreeItem(name, ObjectExplorerObjectDescriptor.CONFIG_FROMFILE, [], undefined, name, [ObjectExplorerTreeItem.F_CONFIG_FROMFILE]));
          cfgKeysProps.push(name);
        }
      });

      proto = Object.keys(plg);
      prefixCFG = /^DEFAULT_KEY_CFG_/;
      proto.filter(name => prefixCFG.test(name)).forEach(d => {
        var nameBase = d.replace(prefixCFG, '').replace('_', '');
        if (!cfgKeysProps.includes(nameBase)) {
          plug.subItems.push(new ObjectExplorerTreeItem(nameBase, ObjectExplorerObjectDescriptor.CONFIG, [], undefined, nameBase, [ObjectExplorerTreeItem.F_CONFIG_DEFAULTVALEXISTS]));
          cfgKeysProps.push(nameBase);
        }
      });

      proto.filter(name => plg[name] instanceof HTMLElement).forEach(d => {
        const pairing = new Map([
          ['ul', ObjectExplorerObjectDescriptor.UI_TREE],
          ['div', ObjectExplorerObjectDescriptor.UI_PAGE],
          ['button', ObjectExplorerObjectDescriptor.UI_BUTTON]
        ]);
        var el = plg[d];
        const typeO = pairing.get(el.tagName.toLowerCase()) || pairing.get('div');
        const nameBase = el.id;
        plug.subItems.push(new ObjectExplorerTreeItem(el.id, typeO, [], undefined, nameBase, [el.tagName.toLowerCase()]));
      });
    });

    // making hierarchy of basic objects
    pluginNodes.forEach(p => p.subItems = pluginInstanceNodes.filter(x => x.title.startsWith(p.title + ':')) );
    pluginGroups.forEach(p => {
      p.subItems = pluginNodes.filter(x => p.plus[0].some(prefix => x.title.startsWith(prefix)));
      pluginNodes = pluginNodes.filter(x => !p.subItems.includes(x));
    });

    // prepare top level data
    this.treeData.push(...pluginGroups, ...pluginNodes);

    // passing data to tree
    const treeDataFlat = this._prepareFlatTreeInput(this.treeData);
    setTreeData(treeDataFlat, this.aliasName);
  }

  _prepareFlatTreeInput(objectData, level = 0) {
    var replystr = '';
    const spaces = ' '.repeat(level);

    objectData.forEach(x => {
      if (x.descriptor.printTree) {
        replystr += spaces;
        replystr += `${x.descriptor.image} ${x.title}|||:_${x.descriptor.abbr}:${x.id}\n`;
        const newLevel = level + 1;
        replystr += this._prepareFlatTreeInput(x.subItems, newLevel);  
      }
    });

    return replystr;
  }

  _buttonAction(evt) {
    this._buttonActionClickOpenCloseAll(evt?.event?.isTrusted);
  }

  onET_ChapterShown(evt) {
  }

}

Plugins.catalogize(puiButtonObjectExplorer);

class ObjectExplorerObjectDescriptor {
  constructor(abbr, image, printTree = true) {
    this.abbr = abbr;
    this.image = image;
    this.t = _T('oeod_' + this.abbr);
    this.printTree = printTree;
  }

  static PLUGIN  = new ObjectExplorerObjectDescriptor('plg', '🧩');
  static PLUGININSTANCE = new ObjectExplorerObjectDescriptor('inst', '🔹');

  static EVENT = new ObjectExplorerObjectDescriptor('evt', '⚡');
  static EVENT_NOHANDLER = new ObjectExplorerObjectDescriptor('evt', '📄⚡');

  static HANDLER = new ObjectExplorerObjectDescriptor('hdl', '👂');

  static CONFIG = new ObjectExplorerObjectDescriptor('cfg', '⚙️');
  static CONFIG_FROMFILE = new ObjectExplorerObjectDescriptor('cfg', '📄⚙️');

  static UI_BUTTON = new ObjectExplorerObjectDescriptor('btn', '🔘');
  static UI_PAGE = new ObjectExplorerObjectDescriptor('page', '🎛️');
  static UI_TREE = new ObjectExplorerObjectDescriptor('tree', '📂');

  static UNDECIDED = new ObjectExplorerObjectDescriptor('und', '❔');
}

class ObjectExplorerTreeItem {
  static F_EVENT_NOHANDLER = 'EVENT_NOHANDLER';
  static F_EVENT_WHANDLER = 'EVENT_WHANDLER';
  static F_CONFIG_FROMFILE = 'CONFIG_FROMFILE';
  static F_CONFIG_DEFAULTVALEXISTS = 'CONFIG_DEFAULTVALEXISTS';
  
  constructor(id, descriptor, subItems, interconnectedObject, title, plus = []) {
    this.id = id;
    this.descriptor = descriptor;
    this.subItems = subItems || [];
    this.title = title || this.id;
    this.plus = plus || [];
    this.interconnectedObject = interconnectedObject;
  }
}
