class puiButtonObjectExplorer extends puiButtonTabTree {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ObjectExplorer';
    this.DEFAULT_KEY_CFG_CAPTION = '🧩';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_TREEID = 'objectList';
  }

  init() {
    super.init();
    hideButton(this.button.id, false);
  }

  deInit() {
    super.deInit();
  }

  onET_UserDataFileLoaded(evt) {
    hideButton(this.button.id, true);
  }

  _preShowAction(evt) {
    const plugins = getPluginsState();

    this.treeData = [];
    this.treeData.push(...plugins[0].map(x => [x, ObjectExplorerObjectDescriptor.PLUGIN, []]));

    this.treeData.forEach(xa => {
      log('E !!! xa name: ' + xa[0]);
      xa[2].push(...plugins[1].filter(x => x.startsWith(xa[0] + ':')).map(x => [x, ObjectExplorerObjectDescriptor.PLUGININSTANCE, []]));
      log('E !!! xa2 name: ' + xa[2][xa[2].length - 1][0]);

      const plugin = plugins[2].filter(x => x[0] == xa[2][xa[2].length - 1][0])?.[0]?.[1];
      if (!plugin) log('E !!! plugin not found',  xa[2][xa[2].length - 1][0]);
      log('W !!! plugin ', plugin);
      plugin.eventDefinitions.forEach(evt => {
        log('W EVT1: ', evt);
        xa[2].push([evt[0], evt[2] ? ObjectExplorerObjectDescriptor.EVENT : ObjectExplorerObjectDescriptor.EVENT_NOHANDLER, []]);
      });

      var proto = Object.getPrototypeOf(plugin);
      const prefixEventHandler = /^onET/;
      Object.getOwnPropertyNames(proto).filter(name => prefixEventHandler.test(name)).forEach(name => {
        browseMember(proto, name, (desc) => {
          if (typeof desc.value !== 'function') return;
          var nameBase = name.replace(prefixEventHandler, '');
          xa[2].push([nameBase, ObjectExplorerObjectDescriptor.HANDLER, []]);
        });  
      }
      );

    });

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
      if (x[1].printTree) {
        replystr += spaces;
        replystr += `${x[1].image} ${x[0]}|||:_${x[1].abbr}:${x[0]}\n`;
        const newLevel = level + 1;
        replystr += this._prepareFlatTreeInput(x[2], newLevel);  
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
}