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
    log('E x!!!', plugins);

    this.treeData = [];
    const pluginGroups = this.cfgGroupsList.map(x => new ObjectExplorerTreeItem(x, new ObjectExplorerObjectDescriptor('grp', this.config[x], true), [], undefined, _T(x), [this.config[`${x}-F`].split(';')]));
    var pluginNodes = plugins[0].map(x => new ObjectExplorerTreeItem(x, ObjectExplorerObjectDescriptor.PLUGIN, [], ));
    var pluginInstanceNodes = plugins[2].map(x => new ObjectExplorerTreeItem(x[0], ObjectExplorerObjectDescriptor.PLUGININSTANCE, [], x[1]));

    pluginNodes.forEach(p => p.subItems = pluginInstanceNodes.filter(x => x.title.startsWith(p.title + ':')) );
    pluginGroups.forEach(p => {
      p.subItems = pluginNodes.filter(x => p.plus[0].some(prefix => x.title.startsWith(prefix)));
      pluginNodes = pluginNodes.filter(x => !p.subItems.includes(x));
    });

    this.treeData.push(...pluginGroups, ...pluginNodes);

    log('E !!!', pluginGroups);
    log('E !!!', pluginNodes);
    log('E !!!', plugins[2]);
    log('E !!!', pluginInstanceNodes);
    log('W  rrr ', this.treeData);

    // // this.treeData.forEach(xa => {
    // //   log('E !!! xa name: ' + xa[0]);
    // //   xa[2].push(...plugins[1].filter(x => x.startsWith(xa[0] + ':')).map(x => [x, ObjectExplorerObjectDescriptor.PLUGININSTANCE, []]));
    // //   log('E !!! xa2 name: ' + xa[2][xa[2].length - 1][0]);

    // //   const plugin = plugins[2].filter(x => x[0] == xa[2][xa[2].length - 1][0])?.[0]?.[1];
    // //   if (!plugin) log('E !!! plugin not found',  xa[2][xa[2].length - 1][0]);
    // //   log('W !!! plugin ', plugin);
    // //   plugin.eventDefinitions.forEach(evt => {
    // //     log('W EVT1: ', evt);
    // //     xa[2].push([evt[0], evt[2] ? ObjectExplorerObjectDescriptor.EVENT : ObjectExplorerObjectDescriptor.EVENT_NOHANDLER, []]);
    // //   });

    // //   var proto = Object.getPrototypeOf(plugin);
    // //   const prefixEventHandler = /^onET/;
    // //   Object.getOwnPropertyNames(proto).filter(name => prefixEventHandler.test(name)).forEach(name => {
    // //     browseMember(proto, name, (desc) => {
    // //       if (typeof desc.value !== 'function') return;
    // //       var nameBase = name.replace(prefixEventHandler, '');
    // //       xa[2].push([nameBase, ObjectExplorerObjectDescriptor.HANDLER, []]);
    // //     });
    // //   });

    // //   var cfgKeys = [...Object.keys(plugin.config)];

    // //   var proto = plugin.constructor;
    // //   const prefixCFG = /^KEY_CFG_/;
    // //   Object.getOwnPropertyNames(proto).filter(name => prefixCFG.test(name)).forEach(name => {
    // //     browseMember(proto, name, (desc) => {
    // //       var nameBase = desc.value;
    // //       cfgKeys.push(nameBase);
    // //     });
    // //   });

    // //   cfgKeys = [...new Set([...cfgKeys])];
    // //   cfgKeys = cfgKeys.filter(x => x);
    // //   var instance = xa[2].filter(x => x[0] == plugin);
    // //   cfgKeys.forEach((x) => xa[2].push([x, ObjectExplorerObjectDescriptor.CONFIG, []]));
    // // });

    // this.treeData.push(...plugins[1].map(x => [x, ObjectExplorerObjectDescriptor.PLUGININSTANCE]));
    // for
    // this.treeData.push(...plugins[2].map(x => [x[1].eventDefinitions[0]., ObjectExplorerObjectDescriptor.EVENT]));

    const treeDataFlat = this._prepareFlatTreeInput(this.treeData);
    //this.treeData.map(x => `${x[1].image} ${x[0]}|||:_${x[1].abbr}:${x[0]}`);

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
  static UNDECIDED = new ObjectExplorerObjectDescriptor('und', '❔');
}

class ObjectExplorerTreeItem {
  constructor(id, descriptor, subItems, interconnectedObject, title, plus = []) {
    this.id = id;
    this.descriptor = descriptor;
    this.subItems = subItems || [];
    this.title = title || this.id;
    this.plus = plus || [];
    this.interconnectedObject = interconnectedObject;
  }
}
