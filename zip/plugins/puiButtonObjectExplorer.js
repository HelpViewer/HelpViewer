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
    this.pluginNodes = pluginNodes;

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
            plug.subItems.push(new ObjectExplorerTreeItem(baseN + nameBase, ObjectExplorerObjectDescriptor.CONFIG, [], plg, nameBase));
            cfgKeysProps.push(nameBase);
          }
        });
      });

      getCfgVarsFromObject(proto, prefixCFG);

      var cfgKeysCfgState = [...Object.keys(plg.config).filter(x => !cfgKeysProps.includes(x))].filter(x => x);
      cfgKeysCfgState.forEach(name => {
        if (!cfgKeysProps.includes(name)) {
          plug.subItems.push(new ObjectExplorerTreeItem(baseN + name, ObjectExplorerObjectDescriptor.CONFIG_FROMFILE, [], plg, name, [ObjectExplorerTreeItem.F_CONFIG_FROMFILE]));
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
        plug.subItems.push(new ObjectExplorerTreeItem(baseN + el.id, typeO, [], el, nameBase, [el.tagName.toLowerCase(), el.innerText]));
      });
    });

    // making hierarchy of basic objects
    pluginNodes.forEach(p => p.subItems = pluginInstanceNodes.filter(x => x.title.startsWith(p.title + ':')) );
    pluginGroups.forEach(p => {
      p.subItems = pluginNodes.filter(x => p.plus[0].some(prefix => x.title.startsWith(prefix)));
      pluginNodes = pluginNodes.filter(x => !p.subItems.includes(x));
    });

    var prodLines = pluginInstanceNodes.map((x) => x.title.split(':')[1]).filter((x) => x);
    prodLines = [...new Set(prodLines)];
    prodLines = prodLines.map((r) => new ObjectExplorerTreeItem(r, ObjectExplorerObjectDescriptor.GROUPPROC, [], undefined, r));
    prodLines.forEach(e => e.subItems = pluginInstanceNodes.filter(x => x.title.endsWith(':' + e.id)) );
    prodLines = new ObjectExplorerTreeItem(ObjectExplorerObjectDescriptor.GROUPPROC.abbr, ObjectExplorerObjectDescriptor.GROUPPROC, prodLines, undefined, _T(ObjectExplorerObjectDescriptor.GROUPPROC.t));

    //:_/__/README.md
    var firstPage = new ObjectExplorerTreeItem('/README', ObjectExplorerObjectDescriptor.DOCUMENT, [], undefined, _T('overview'));

    // prepare top level data
    this.treeData.push(firstPage, ...pluginGroups, ...pluginNodes, prodLines);

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

  _getConfigKeyValues(keyBaseName, instance) {
    const nameDefault = `DEFAULT_KEY_CFG_${keyBaseName}`;
    const defVal = instance[nameDefault];
    const valCurrent = instance.config[keyBaseName];
    return [valCurrent || defVal, defVal];
  }

  _browseTreeForItem(pathSplits, objectData, base = '') {
    if (!pathSplits || pathSplits.length == 0 || !objectData) 
      return;

    const newSplits = pathSplits.slice(1);
    const currentToSearch = `${base}${pathSplits[0]}`;

    const found = objectData.filter(x => x.id == currentToSearch);

    if (found.length == 0)
      return;

    if (newSplits.length == 0)
      return found[0];

    return this._browseTreeForItem(newSplits, found[0].subItems, `${currentToSearch}:`);
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
        objName = uriParts.slice(1).join(':');
  
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
    const objNamePreprocessed = objName.replace(new RegExp(':', 'g'), '_');
    const objNameLocalSplits = objName.split(':');
    var objNameLocal = '';
    var i = 0;
    do {
      objNameLocal = `${objNameLocalSplits.pop()}${(i > 0)? ':' : ''}${objNameLocal}`;
      i++;
    } while (objNameLocal.length == 0);
    const altPath = `${basePath}${generalType}_${objNamePreprocessed}.md`;
    log(`W ObjectExplorer: requested path: ${altPath}`);
    
    this.C_AUTODESC = '<!-- %AUTODESC% -->';
    r.result = r.result.then(() => r.getStorageData(altPath).then((v) => r.content = v ? `## ${_T('overview')}\n${v}\n` : ''));
    r.result = r.result.then(() => r.content += (!r.content.includes(this.C_AUTODESC)) ? `${this.C_AUTODESC}\n` : '');
    const found = this._browseTreeForItem(objName.split(':'), this.pluginNodes);
    var desc = '';
    r.tokens.push(r.TOKEN_NONOTFOUNDMSG);

    var delayedFunction = undefined;

    switch (typeInRequest) {
      case ObjectExplorerObjectDescriptor.GROUP.abbr:
        desc = _T(`${objName}-D`);
        break;

      case ObjectExplorerObjectDescriptor.UI_BUTTON.abbr:
        desc = found.plus[1];
        break;

      case ObjectExplorerObjectDescriptor.PLUGININSTANCE.abbr:
        const sign = found.interconnectedObject.eventIdStrict ? '🔺' : '🟢';//🔻
        const t = found.interconnectedObject.eventIdStrict ? _T('eventIdStrict1') : _T('eventIdStrict0');
        desc = `- ${sign} ${t}`;
        break;
      
      case ObjectExplorerObjectDescriptor.CONFIG.abbr:
      case ObjectExplorerObjectDescriptor.CONFIG_FROMFILE.abbr:
        const vals = this._getConfigKeyValues(found.title, found.interconnectedObject);
        vals[0] = vals[0] ?? '';
        vals[1] = vals[1] ?? '';
        const valMd = vals[0] == vals[1] ? vals[0] : `**${vals[0]}**`;
        desc = `**${_T('value')}:**\n\n${valMd}\n\n**${_T('default')}:**\n\n${vals[1]}\n\n`;
        break;

      case ObjectExplorerObjectDescriptor.EVENT.abbr:
      case ObjectExplorerObjectDescriptor.EVENT_NOHANDLER.abbr:
      case ObjectExplorerObjectDescriptor.HANDLER.abbr:
        const reply = this._getNamesForEventClassHandler(found.interconnectedObject);
        if (reply && reply.length >= 3) {
          const [evtName, evtClassI, evtHandler] = reply;
          delayedFunction = async () => {
            var desc = '';
            desc += `## ${ObjectExplorerObjectDescriptor.EVENT.image} ${evtName} (${evtClassI.constructor.name})\n| ${_T('name')} | ${_T('default')} | ${_T('datatype')} |\n| --- | --- | --- |\n`;

            const props = Object.getOwnPropertyNames(evtClassI);
            const propRows = props.map((name, i) => `| [${name}](#h-4-${i}) | ${typeof evtClassI[name] === "function" ? '[FUNCTION]' : evtClassI[name]} | ${typeof(evtClassI[name])} |`).join('\n');
            
            desc += propRows;
            desc += `\n### ${_T('meaning')}\n`;

            const rv = await Promise.all(props.map(async (name) => 
            {
              const propNameToClass = `i/${getActiveLanguage()}/p_${evtName}_${name}.md`;
              const propNameGeneral = `i/${getActiveLanguage()}/p__${name}.md`;
              log(`W ObjectExplorer: requested path: ${propNameToClass}, backup: ${propNameGeneral}`);
              return [
                `#### ${name} (${typeof(evtClassI[name])})`, 
                await r.getStorageData(propNameToClass), 
                await r.getStorageData(propNameGeneral)];
            }));

            rv.forEach(([h, dC, dG]) => desc += `${h}\n${dC || dG}\n`);
            
            return desc;
          }
        }
        break;

      default:
        break;
    }

    if (found) {
      var orderedByType = new Map();
      ObjectExplorerObjectDescriptor._BIGCLASS_R.forEach(
        (x, v) => orderedByType.set(v, found.subItems.filter(
          si => x.includes(si.descriptor.abbr)
        )) );
      var orderedByTypeA = [...orderedByType].filter(([k, v]) => v.length > 0);
  
      orderedByTypeA = orderedByTypeA.map(([k, v]) => {
        if (k == ObjectExplorerObjectDescriptor._BIGCLASS_CFGOPT) {
          const items = v.map((r) => {
            const vals = this._getConfigKeyValues(r.title, r.interconnectedObject);
            vals[0] = vals[0] ?? '';
            vals[1] = vals[1] ?? '';
            const equality = (vals[0] == vals[1]);
            vals[0] = equality ? vals[0] : `**${vals[0]}**`;
            const title = equality ? r.title : `**${r.title}**`;
            return `| ${title} | ${vals[0]} | ${vals[1]} |`;
          });
          return `## ${ObjectExplorerObjectDescriptor.CONFIG.image} ${_T(k)}\n| ${_T('name')} | ${_T('value')} | ${_T('default')} |\n| --- | --- | --- |\n${items.join('\n')}`;
        }
  
        if (k == ObjectExplorerObjectDescriptor._BIGCLASS_HDL) {
          const items = v.map((r) => `- ${r.descriptor.image} ${r.title} (${_T(r.title.startsWith('_') ? 'openToIdAll' : 'openToId')})`);
          return `## ${_T(k)}\n${items.join('\n')}`;
        }
        
        const items = v.map((r) => `- ${r.plus[0] == 'button' ? r.plus[1] + ' ' : ''}${r.descriptor.image} ${r.title}`);
        return `## ${_T(k)}\n${items.join('\n')}`;
      });
  
      r.result = r.result.then(() => {
        r.content += `\n${orderedByTypeA.join('\n')}`;
      });
    }

    const typeLink = this.objTypesMap.get(typeInRequest);
    if (typeLink == ObjectExplorerObjectDescriptor.GROUP)
      r.heading = `${this.config[objName]} ${_T(objName)}`;
    else
      r.heading = `${typeLink.image} ${objNameLocal}`;

    if (delayedFunction)
      r.result = r.result.then(() => delayedFunction().then(x => r.content += x));

    r.result = r.result.then(() => r.content = r.content.replace(this.C_AUTODESC, desc));
  }

  _getNamesForEventClassHandler(found) {
    if (!found)
      return undefined;
    
    var eventName = found?.[0];
    var cls = found?.[1];
    var handlerName = found?.value?.name;
    
    if (handlerName && !eventName) {
      eventName = handlerName.replace('onET', '');
      if (eventName.startsWith('_'))
        eventName = eventName.substring(1);
    }

    cls = getEventInput(eventName);

    return [eventName, cls, handlerName];
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
  static GROUPPROC = new ObjectExplorerObjectDescriptor('grpproc', '⇄');

  static _BIGCLASS_CFGOPT = 'cfgopt';
  static _BIGCLASS_HDL = 'hdl';

  static _BIGCLASS = new Map([
    ['cfg', ObjectExplorerObjectDescriptor._BIGCLASS_CFGOPT],
    ['cfgE', ObjectExplorerObjectDescriptor._BIGCLASS_CFGOPT],
    ['evt', 'event'],
    ['evtD', 'event'],
    ['hdl', ObjectExplorerObjectDescriptor._BIGCLASS_HDL],
    ['btn', 'uiobject'],
    ['page', 'uiobject'],
    ['tree', 'uiobject'],
    ['inst', 'oeod_inst'],
  ]);

  static _BIGCLASS_R = reverseMap(this._BIGCLASS);
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

function reverseMap(source) {
  const reply = new Map();

  for (const [key, value] of source) {
    if (!reply.has(value)) reply.set(value, []);
    reply.get(value).push(key);
  }

  return reply;
}
