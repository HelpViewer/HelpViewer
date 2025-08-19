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
    this.eventIdStrict = false;
    super.init();
    hideButton(this.button.id, false);

    const T = this.constructor;
    const TI = this;
    this.cfgGroupsList = (this.config[T.KEY_CFG_GROUPSLIST] || TI.DEFAULT_KEY_CFG_GROUPSLIST)?.split(';');
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
    const pluginGroups = this.cfgGroupsList.map(x => new ObjectExplorerTreeItem(x, new ObjectExplorerObjectDescriptor('grp', this.config[x], true), [], undefined, _T(x), [this.config[`${x}-F`]?.split(';')]));
    var pluginNodes = plugins[0].map(x => new ObjectExplorerTreeItem(x, ObjectExplorerObjectDescriptor.PLUGIN, [], ));
    var pluginInstanceNodes = plugins[2].map(x => new ObjectExplorerTreeItem(x[0], ObjectExplorerObjectDescriptor.PLUGININSTANCE, [], x[1]));

    // plugin instances data reading
    pluginInstanceNodes.forEach(plug => {
      const plg = plug.interconnectedObject;
      var proto = Object.getPrototypeOf(plg);
      const baseN = `${plug.id}:`;

      const prefixEventHandler = /^onET/;
      Object.getOwnPropertyNames(proto).filter(name => prefixEventHandler.test(name)).forEach(name => {
        browseMember(proto, name, (desc) => {
          if (typeof desc.value !== 'function') return;
          var nameBase = name.replace(prefixEventHandler, '');
          // if (nameBase.startsWith('_'))
          //   nameBase = nameBase.substring(1);
          plug.subItems.push(new ObjectExplorerTreeItem(baseN + name, ObjectExplorerObjectDescriptor.HANDLER, [], desc, nameBase));
        });
      });

      plg.eventDefinitions.forEach(evt => {
        plug.subItems.push(new ObjectExplorerTreeItem(baseN + evt[0], 
          evt[2] ? ObjectExplorerObjectDescriptor.EVENT : ObjectExplorerObjectDescriptor.EVENT_NOHANDLER, 
          [], evt, evt[0], 
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
            plug.subItems.push(new ObjectExplorerTreeItem(baseN + nameBase, ObjectExplorerObjectDescriptor.CONFIG, [], desc, nameBase));
            cfgKeysProps.push(nameBase);
          }
        });
      });

      getCfgVarsFromObject(proto, prefixCFG);

      var cfgKeysCfgState = [...Object.keys(plg.config).filter(x => !cfgKeysProps.includes(x))].filter(x => x);
      cfgKeysCfgState.forEach(name => {
        if (!cfgKeysProps.includes(name)) {
          plug.subItems.push(new ObjectExplorerTreeItem(baseN + name, ObjectExplorerObjectDescriptor.CONFIG_FROMFILE, [], plg.config, name, [ObjectExplorerTreeItem.F_CONFIG_FROMFILE]));
          cfgKeysProps.push(name);
        }
      });

      proto = Object.keys(plg);
      prefixCFG = /^DEFAULT_KEY_CFG_/;
      proto.filter(name => prefixCFG.test(name)).forEach(d => {
        var nameBase = d.replace(prefixCFG, '').replace('_', '');
        if (!cfgKeysProps.includes(nameBase)) {
          plug.subItems.push(new ObjectExplorerTreeItem(baseN + nameBase, ObjectExplorerObjectDescriptor.CONFIG, [], plg, nameBase, [ObjectExplorerTreeItem.F_CONFIG_DEFAULTVALEXISTS]));
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
        plug.subItems.push(new ObjectExplorerTreeItem(baseN + el.id, typeO, [], el, nameBase, [el.tagName.toLowerCase()]));
      });
    });

    // making hierarchy of basic objects
    pluginNodes.forEach(p => p.subItems = pluginInstanceNodes.filter(x => x.title.startsWith(p.title + ':')) );
    pluginGroups.forEach(p => {
      p.subItems = pluginNodes.filter(x => p.plus[0].some(prefix => x.title.startsWith(prefix)));
      pluginNodes = pluginNodes.filter(x => !p.subItems.includes(x));
    });

    //:_/__/README.md
    var firstPage = new ObjectExplorerTreeItem('/README', ObjectExplorerObjectDescriptor.DOCUMENT, [], undefined, _T('overview'));

    // prepare top level data
    this.treeData.push(firstPage, ...pluginGroups, ...pluginNodes);

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
        replystr += `${x.descriptor.image} ${x.title}|||:_${x.descriptor.abbr ? x.descriptor.abbr + ':' : ''}${x.id}.md\n`;
        const newLevel = level + 1;
        replystr += this._prepareFlatTreeInput(x.subItems, newLevel);  
      }
    });

    return replystr;
  }

  _buttonAction(evt) {
    this._buttonActionClickOpenCloseAll(evt?.event?.isTrusted);
  }

  onETShowChapterResolutions(r) {
    this.objTypesMap = this.objTypesMap || new Map();
    this.objTypes = this.objTypes || Object.keys(ObjectExplorerObjectDescriptor).filter(x => !x.startsWith('_')).map(grp => {
      const gr = ObjectExplorerObjectDescriptor[grp];
      this.objTypesMap.set(gr.abbr, gr);
      return gr.abbr;
    });

    var objName = '';
    var typeInRequest;

    try {
      const objTypes = this.objTypes;
      const uriParts = r.uri?.replace('.md', '').split(':') || ['',''];
      if (uriParts.length == 1)
        uriParts.push('');

      objName = uriParts[1].replace(/\.[^/.]+$/, "");
      typeInRequest = uriParts[0];

      if (uriParts.length > 2)
        objName = uriParts.slice(1).join('_');
  
      if (!r.uri.startsWith('i/') && !objTypes.includes(typeInRequest))
        return;
    } catch {
      return;
    }

    const basePath = `i/${getActiveLanguage()}/`;

    if (r.uri.toLowerCase().endsWith('readme.md')) {
      r.result = r.result.then(() => {
        const objClassExport = () => {
          const arr = Object.keys(ObjectExplorerObjectDescriptor).filter(x => !x.startsWith('_')).map(grp => {
            const gr = ObjectExplorerObjectDescriptor[grp];
            return `| ${gr.image} | ${_T(gr.t)} |`;
          });
          return arr.join('\n');
        }
        r.content = r.content.replace('<!-- %OBJCLASS% -->', objClassExport());
  
        const grpExport = () => {
          const arr = this.cfgGroupsList.map(grp => {
            return `| ${this.config[grp]} ${_T(grp)} | ${_T(grp + '-D')} |`;
          });
          return arr.join('\n');
        }
        r.content = r.content.replace('<!-- %GROUPS% -->', grpExport());
      });
      return;
    }
    
    const generalType = ObjectExplorerObjectDescriptor._BIGCLASS.get(typeInRequest) || typeInRequest;
    const altPath = `${basePath}${generalType}_${objName.replace(new RegExp(':', 'g'), '_')}.md`;
    log(`ObjectExplorer: requested path: ${altPath}`);
    r.result = r.result.then(() => r.getStorageData(altPath).then((v) => r.content = v));
    var desc = '';

    switch (typeInRequest) {
      case ObjectExplorerObjectDescriptor.GROUP.abbr:
        desc = _T(`${objName}-D`);
        r.result = r.result.then(() => r.content = r.content || desc);
        break;
    
      default:
        break;
    }
    
    const typeLink = this.objTypesMap.get(typeInRequest);
    if (typeLink == ObjectExplorerObjectDescriptor.GROUP)
      r.heading = `${this.config[objName]} ${_T(objName)}`;
    else
      r.heading = `${typeLink.image} ${_T()}`;
    r.result = r.result.then(() => r.content = r.content.replace('<!-- %AUTODESC% -->', desc));
  }

  onET_ChapterShown(evt) {
  }

}

Plugins.catalogize(puiButtonObjectExplorer);

class ObjectExplorerObjectDescriptor {
  constructor(abbr, image, printTree = true) {
    this.abbr = abbr;
    this.image = image;
    this.t = 'oeod_' + this.abbr;
    this.printTree = printTree;
  }

  static PLUGIN  = new ObjectExplorerObjectDescriptor('plg', '🧩');
  static PLUGININSTANCE = new ObjectExplorerObjectDescriptor('inst', '🔹');

  static EVENT = new ObjectExplorerObjectDescriptor('evt', '⚡');
  static EVENT_NOHANDLER = new ObjectExplorerObjectDescriptor('evtD', '📄⚡');

  static HANDLER = new ObjectExplorerObjectDescriptor('hdl', '👂');

  static CONFIG = new ObjectExplorerObjectDescriptor('cfg', '⚙️');
  static CONFIG_FROMFILE = new ObjectExplorerObjectDescriptor('cfgE', '📄⚙️');

  static UI_BUTTON = new ObjectExplorerObjectDescriptor('btn', '🔘');
  static UI_PAGE = new ObjectExplorerObjectDescriptor('page', '🎛️');
  static UI_TREE = new ObjectExplorerObjectDescriptor('tree', '📂');

  static DOCUMENT = new ObjectExplorerObjectDescriptor('', '📄');

  static UNDECIDED = new ObjectExplorerObjectDescriptor('und', '❔');
  static GROUP = new ObjectExplorerObjectDescriptor('grp', '');

  static _BIGCLASS = new Map([
    ['evt', 'event'],
    ['evtD', 'event'],
    ['cfg', 'cfgopt'],
    ['cfgE', 'cfgopt'],
    ['btn', 'uiobject'],
    ['page', 'uiobject'],
    ['tree', 'uiobject'],
  ]);
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
