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

    // dependency tree for plugin classes preparation
    const clsList = plugins[0].map((x) => Plugins.pluginsClasses.get(x));
    var depTree = clsList.map((x) => x.name);
    for (let x = 0; x < clsList.length; x++)
      depTree[x] = getAllParents(clsList[x]).filter((x) => x).reverse();

    depTree.sort();
    this.DepTree = getObjectCopy(depTree);

    var tree = buildStringTreeFromMap(this._getTreeFromArraysList(depTree, new Map()));
    // adding object tree links
    tree = this._renderPluginClassTree(tree);

    this.TextObjectTree = linesToHtmlTree(tree.join('\n'), 'tree-' + newUID());

    // dependency tree for events preparation
    this.TextEventTree = Object.entries(EventDefinitions).map(([key, value]) => [...new Set([...getAllParents(value.inputType).filter((x) => x).reverse(), key])]);
    tree = buildStringTreeFromMap(this._getTreeFromArraysList(this.TextEventTree, new Map()));
    this.TextEventTree = linesToHtmlTree(tree.join('\n'), 'tree-' + newUID());

    // plugin instances list
    this.PluginInstanceList = plugins[1].map(x => x);

    // preparation of flat lists
    this.treeData = [];
    const pluginGroups = this.cfgGroupsList.map(x => new ObjectExplorerTreeItem(x, new ObjectExplorerObjectDescriptor('grp', this.config[x], true), [], undefined, _T(x), [this.config[`${x}-F`]?.split(';')]));
    var pluginNodes = plugins[0].map(x => new ObjectExplorerTreeItem(x, ObjectExplorerObjectDescriptor.PLUGIN, [], Plugins.pluginsClasses.get(x) ));
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

      const addParamsGetter = new Map([
        [Resource.name.toUpperCase(), (v) => [v._fileLength, v.licenseFile]]
      ]);
      const addParamsGetterBackup = (v) => [v];

      var subModules = getSubmodulesInModule(plg).map(x => [x.constructor.name.toUpperCase(), x.aliasName, x]).sort();
      subModules = subModules.map(v => new ObjectExplorerTreeItem(baseN + v[1], ObjectExplorerObjectDescriptor[v[0]], [], v[2], v[1], (addParamsGetter.get(v[0]) || addParamsGetterBackup)(v[2]) ));
      plug.subItems.push(...subModules);

      // sending events
      plg.eventCallsMap.keys().forEach(evt => {
        plug.subItems.push(new ObjectExplorerTreeItem(baseN + evt, 
          ObjectExplorerObjectDescriptor.TRANSMIT, 
          [], [evt], evt
        ));
      });
    });

    // making hierarchy of basic objects
    pluginNodes.forEach(p => p.subItems = pluginInstanceNodes.filter(x => x.title.startsWith(p.title + ':')) );
    pluginGroups.forEach(p => {
      p.subItems = pluginNodes.filter(x => p.plus[0].some(prefix => x.title.startsWith(prefix)));
      pluginNodes = pluginNodes.filter(x => !p.subItems.includes(x));
    });

    var prodLines = pluginInstanceNodes.map((x) => x.title.split(':')[1]);//.filter((x) => x);
    prodLines = [...new Set(prodLines)];
    prodLines = prodLines.map((r) => new ObjectExplorerTreeItem(r, ObjectExplorerObjectDescriptor.GROUPPROC, [], undefined, r));
    prodLines.forEach(e => e.subItems = pluginInstanceNodes.filter(x => x.title.endsWith(':' + e.id)) );
    prodLines = new ObjectExplorerTreeItem(ObjectExplorerObjectDescriptor.GROUPPROC.t, ObjectExplorerObjectDescriptor.GROUPPROC, prodLines, undefined, _T(ObjectExplorerObjectDescriptor.GROUPPROC.t));
    this.config[ObjectExplorerObjectDescriptor.GROUPPROC.t] = ObjectExplorerObjectDescriptor.GROUPPROC.image;

    this.treeDataFull = [];
    this.treeDataFull.push(firstPage, ...pluginGroups, ...pluginNodes, prodLines);

    //:_/__/README.md
    var firstPage = new ObjectExplorerTreeItem('/README', ObjectExplorerObjectDescriptor.DOCUMENT, [], undefined, _T('overview'));
    var objectTree = new ObjectExplorerTreeItem('/TREE', ObjectExplorerObjectDescriptor.UI_TREE, [], undefined, _T('dependTree'));
    var orderTree = new ObjectExplorerTreeItem('/LORDER', ObjectExplorerObjectDescriptor.DOCUMENT, [], undefined, _T('orderLoading'));

    // prepare top level data
    this.treeData.push(firstPage, objectTree, orderTree, ...pluginGroups, ...pluginNodes, prodLines);

    // passing data to tree
    const treeDataFlat = this._prepareFlatTreeInput(this.treeData);
    setTreeData(treeDataFlat, this.aliasName);

    log('W Found event calls by auto discover:', this.foundEventCalls);
  }

  _renderPluginClassTree(treeI) {
    const pluginGroupsTable = this.cfgGroupsList.map(x => [this.config[`${x}-F`]?.split(';'), this.config[x]]);
    pluginGroupsTable.push([['Object'], '⚙️']);
    pluginGroupsTable.push([['IEvent'], '⚡']);
    treeI = treeI.map(row => {
      const nameR = row.trim();
      var newRow = `${row}|||:_${ObjectExplorerObjectDescriptor.PLUGIN.abbr}:${row.trim()}.md`;
      const firstIndex = row.search(/\S/);
      const icon = pluginGroupsTable.find((g) => g[0].some(prefix => nameR.startsWith(prefix)))?.[1] || '🧩';
      newRow = insertToStringAtIndex(newRow, firstIndex, icon + ' ');
      return newRow;
    });
    return treeI;
  }

  _getTreeFromArraysList(source, reply) {
    if (!source || source.length == 0)
      return reply;

    source = source.filter((x) => x && x.length > 0);

    const siblings = [...new Set(source.map((x) => x[0]))].filter((x) => x);

    siblings.forEach((x) => reply.set(x, []));

    source.forEach(r => {
      const first = r.shift();

      if (first)
        reply.get(first).push(r);
    });

    reply.forEach((v, k) => {
      const oneLev = new Map();
      this._getTreeFromArraysList(v, oneLev);
      reply.set(k, oneLev);
    });

    return reply;
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

  _collectEventComPath(objectData, collectedData, eventName, pluginName, instanceName, strictSwitch = false, level = 0) {
    objectData.forEach(x => {
      //isEventHandlerOpened(alias, strictSwitch, d.id)
      const newLevel = level + 1;
      if (level === 0 || level === 1) {
        if (x.descriptor == ObjectExplorerObjectDescriptor.PLUGIN)
          this._collectEventComPath(x.subItems, collectedData, eventName, x.id, undefined, false, newLevel);
        if (x.descriptor == ObjectExplorerObjectDescriptor.PLUGININSTANCE) {
          const nextInstName = x.id.substring(pluginName.length + 1);
          this._collectEventComPath(x.subItems, collectedData, eventName, pluginName, nextInstName, x.interconnectedObject.eventIdStrict, newLevel);
          x.interconnectedObject.eventCallsMap.get(eventName)?.forEach(regi => {
            const [handler, ide] = regi.split(':');
            collectedData.push(new EventCommunicationPathInfo(pluginName, nextInstName, handler, EventCommunicationPathInfo.DIR_TRANSMIT, strictSwitch));
          });
        }
      } else {
        var id = x.id.split(':').pop();
        if (id == eventName || x.id.endsWith(`:onET${eventName}`) || x.id.endsWith(`:onET_${eventName}`)) {
          if (x.descriptor == ObjectExplorerObjectDescriptor.EVENT_NOHANDLER)
            collectedData.push(new EventCommunicationPathInfo(pluginName, instanceName, id, EventCommunicationPathInfo.DIR_DEFINITION, strictSwitch));
          if (x.descriptor == ObjectExplorerObjectDescriptor.EVENT)
            collectedData.push(new EventCommunicationPathInfo(pluginName, instanceName, id, EventCommunicationPathInfo.DIR_ACCEPT, strictSwitch));
          if (x.descriptor == ObjectExplorerObjectDescriptor.HANDLER)
            collectedData.push(new EventCommunicationPathInfo(pluginName, instanceName, id, EventCommunicationPathInfo.DIR_ACCEPT, strictSwitch));
        }
      }

    });
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

    if (r.uri.toLowerCase().endsWith('/tree.md')) {
      r.result = r.result.then(() => {
        var descr = ObjectExplorerObjectDescriptor.PLUGIN;
        r.content = `## ${descr.image} ${_T(descr.t)} (~${Plugins.pluginsClasses.size}/${Plugins.plugins.size})\n<ul class="tree">${this.TextObjectTree.replace(new RegExp('<details>', 'g'), '<details open>')}</ul>\n\n`;
        r.content += '&nbsp;\n\n';
        descr = ObjectExplorerObjectDescriptor.EVENT;
        r.content += `## ${descr.image} ${_T('event')} (~${Object.entries(EventDefinitions).length})\n<ul class="tree">${this.TextEventTree.replace(new RegExp('<details>', 'g'), '<details open>')}</ul>\n\n`;
      });
      return;
    }

    if (r.uri.toLowerCase().endsWith('/lorder.md')) {
      r.result = r.result.then(() => {
        var descr = ObjectExplorerObjectDescriptor.PLUGININSTANCE;
        r.content += `# ${descr.image} ${_T('orderLoading')} (${this.PluginInstanceList.length})\n${this.PluginInstanceList.map((x,idx) => `${idx + 1}. ${descr.image} [${x}](:_${descr.abbr}:${x}.md)`).join('\n')}\n\n`;
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
    const valKiBs = (size) => Math.round(size / 1024 * 100) / 100;

    switch (typeInRequest) {
      case ObjectExplorerObjectDescriptor.GROUP.abbr:
      case ObjectExplorerObjectDescriptor.GROUPPROC.abbr:
        desc = _T(`${objName}-D`);
        if (desc.startsWith('_'))
          desc = '';
        break;

      case ObjectExplorerObjectDescriptor.UI_BUTTON.abbr:
        desc = found.plus[1];
        break;

      case ObjectExplorerObjectDescriptor.RESOURCE.abbr:
        delayedFunction = async () => {
          var desc = '';
          var prom = Promise.resolve();

          const fileList = found.interconnectedObject.fileList.map((x) => `- ${x}`).join('\n');
          desc += `## ${_T('resources')}\n${fileList}\n---\n**${_T('size')}:** ${valKiBs(found.plus[0])} kB\n\n`

          var licFile = found.plus?.[1];
          if (licFile) {
            licFile = await storageSearch(found.interconnectedObject.source, licFile);

            if (licFile)
              desc += `## ⚖ ${_T('license')}\n\n${licFile}\n\n`;
          }

          return desc;
        };
        break;

      case ObjectExplorerObjectDescriptor.PLUGIN.abbr:
        const parentClasses1 = this._getLineWithDependencyTree(found?.interconnectedObject);
        desc += `\n\n[</> ${_T('oeod_cpp')}](:_${ObjectExplorerObjectDescriptor.CODEPRINT.abbr}:${objName.split(':')[0]}.md)\n\n`;

        // prepare dependency tree with current plugin class as base (top level item) and down to implementing classes
        const clsName = found?.interconnectedObject.name;
        var classTree = getObjectCopy(this.DepTree).filter(x => x.includes(clsName));
        if (classTree.length > 1) {
          const index = classTree[0]?.findIndex(x => x == clsName);
          classTree = classTree.map(x => x.splice(index));
          classTree = buildStringTreeFromMap(this._getTreeFromArraysList(classTree, new Map()));
          classTree = this._renderPluginClassTree(classTree);
          classTree = linesToHtmlTree(classTree.join('\n'), 'tree-' + newUID());
          classTree = `<ul class="tree">${classTree.replace(new RegExp('<details>', 'g'), '<details open>')}</ul>\n\n`;  
        } else {
          classTree = '';
        }
        desc += `## 📂 ${_T('dependTree')}\n${parentClasses1}\n\n${classTree}`;
        break;

      case ObjectExplorerObjectDescriptor.PLUGININSTANCE.abbr:
        objNameLocal = objName;
        const sign = found.interconnectedObject.eventIdStrict ? '🔺' : '🟢';//🔻
        const t = found.interconnectedObject.eventIdStrict ? _T('eventIdStrict1') : _T('eventIdStrict0');
        const parentClasses = this._getLineWithDependencyTree(found?.interconnectedObject?.constructor);
        
        desc = `- 📂 ${parentClasses}\n- ${sign} ${t}\n## 📦 ${_T('resources')}\n- [${_T('oeod_plg')}](:_${ObjectExplorerObjectDescriptor.CODEPRINT.abbr}:${objName.split(':')[0]}.md): ${valKiBs(found?.interconnectedObject?.constructor?._fileLength)} kB`;

        var proto = found?.interconnectedObject;
        const resourcesList = [];
        Object.getOwnPropertyNames(proto).filter(name => name.startsWith('RES_')).forEach(name => {
          browseMember(proto, name, (desc) => {
            const v = desc.value;
            if ((!v.aliasName || !v._fileLength)) return;
            resourcesList.push(`\n- [${v.aliasName}](:_${ObjectExplorerObjectDescriptor.RESOURCE.abbr}:${objName}:${v.aliasName}.md): ${valKiBs(v._fileLength)} kB`);
          });
        });

        desc += resourcesList.join('');

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
      case ObjectExplorerObjectDescriptor.TRANSMIT.abbr:
        const reply = this._getNamesForEventClassHandler(found?.interconnectedObject);
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
            
            desc += `\n## ⇄ ${_T('commPath')}\n`;
            desc += `\n**${_T('direction')}**\n`;
            desc += `- ${EventCommunicationPathInfo.DIR_TRANSMIT} ${_T('transmitter')} (DIR_TRANSMIT)\n`;
            desc += `- ${EventCommunicationPathInfo.DIR_ACCEPT} ${_T('hdl')} (DIR_ACCEPT)\n`;
            desc += `- ${EventCommunicationPathInfo.DIR_DEFINITION} ${_T('oeod_evtD')} (DIR_DEFINITION)\n`;
            desc += `\n**${_T('filter')}**\n`;
            desc += `- 🟢 ${_T('openToIdAll')}\n`;
            desc += `- 🔺 ${_T('openToId')}\n`;

            var collectedData = [];
            this._collectEventComPath(this.pluginNodes, collectedData, evtName);
            const grouped = groupBy(collectedData, (e) => e.instanceName);

            for (const path in grouped) {
              desc += `\n### ⇄ ${path}\n| ${_T('oeod_plg')} | ${_T('oeod_inst')} | ${_T('oeod_hdl')} | ${_T('direction')} | ${_T('filter')} |\n| --- | --- | --- | :---: | :---: |\n`;
              grouped[path].forEach(i => 
                desc += `| [${i.pluginName}](:_${ObjectExplorerObjectDescriptor.PLUGIN.abbr}:${i.pluginName}.md) | [${i.instanceName}](:_${ObjectExplorerObjectDescriptor.PLUGININSTANCE.abbr}:${i.pluginName}:${i.instanceName}.md) | ${i.handlerName} | ${i.direction} | ${i.openedAll ? '🟢' : '🔺'} |\n`
              );
            }

            return desc;
          }
        }
        break;

      case ObjectExplorerObjectDescriptor.CODEPRINT.abbr:
        desc = `## </> ${_T('oeod_cpp')}\n\`\`\`javascript\n${Plugins.pluginsClasses.get(objName)}\n\`\`\`\n`;
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
          const items = v.map((r) => `- ${r.descriptor.image} [${r.title}](:_${r.descriptor.abbr}:${r.id}.md) (${_T(r.title.startsWith('_') ? 'openToIdAll' : 'openToId')})`);
          return `## ${ObjectExplorerObjectDescriptor.HANDLER.image} ${_T(k)}\n${items.join('\n')}`;
        }
        
        const items = v.map((r) => `- ${r.plus[0] == 'button' ? r.plus[1] + ' ' : ''}${r.descriptor.image} [${r.title}](:_${r.descriptor.abbr}:${r.id}.md)`);
        return `## ${ObjectExplorerObjectDescriptor[`_i_${k}`]} ${_T(k)}\n${items.join('\n')}`;
      });
  
      r.result = r.result.then(() => {
        r.content += `\n${orderedByTypeA.join('\n')}`;
      });
    }

    const typeLink = this.objTypesMap.get(typeInRequest);
    if (typeLink == ObjectExplorerObjectDescriptor.GROUP || (typeLink == ObjectExplorerObjectDescriptor.GROUPPROC && objNameLocal == 'oeod_grpproc'))
      r.heading = `${this.config[objName]} ${_T(objName)}`;
    else
      r.heading = `${typeLink.image} ${objNameLocal}`;

    if (delayedFunction)
      r.result = r.result.then(() => delayedFunction().then(x => r.content += x));

    r.result = r.result.then(() => r.content = r.content.replace(this.C_AUTODESC, desc));
  }

  _getLineWithDependencyTree(baseClass, delimiter = ' -> ', links = true) {
    var depends = getAllParents(baseClass).filter((x) => x);

    if (links)
      depends = depends.map((x) => `[${x}](:_${ObjectExplorerObjectDescriptor.PLUGIN.abbr}:${x}.md)`);

    return depends.join(delimiter);
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

  onET_DebugEventEvent(evt) {
    this.foundEventCalls = this.foundEventCalls || 0;
    const stack = evt.stack.split('\n').slice(2).map((x) => x.trim().substring(3)).filter((x) => !/^(<anonymous>|sendEventWProm|new Promise|sendEvent|Object.snd|handlerFilterId)/i.test(x));
    var pluginCallee = stack.filter((x) => x.startsWith('p'));
    if (pluginCallee && pluginCallee.length > 0)
      pluginCallee = pluginCallee[0];
    else {
      pluginCallee = stack.filter((x) => x.startsWith('$'));
      if (pluginCallee && pluginCallee.length > 0)
        pluginCallee = pluginCallee[0].substring(1).replace('$', '.');
      else
        return;
    }


    if (pluginCallee)
      var [pluginCallee, method] = pluginCallee.split('.');

    if (pluginCallee && method) {
      method = method.split(' ')[0];
      [...Plugins.plugins.keys()].filter(x => x.startsWith(pluginCallee + ':')).forEach((x) => Plugins.plugins.get(x).catalogizeEventCall(method, evt.data.eventName, ''));
      this.foundEventCalls++;
    }
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

  static SYSTEMEVENTHANDLER = new ObjectExplorerObjectDescriptor('evtSys', '⭐');
  
  static EVENT = new ObjectExplorerObjectDescriptor('evt', '⚡');
  static EVENT_NOHANDLER = new ObjectExplorerObjectDescriptor('evtD', '📄⚡');

  static HANDLER = new ObjectExplorerObjectDescriptor('hdl', '👂');
  static TRANSMIT = new ObjectExplorerObjectDescriptor('tra', '🛰️');

  static CONFIG = new ObjectExplorerObjectDescriptor('cfg', '⚙️');
  static CONFIG_FROMFILE = new ObjectExplorerObjectDescriptor('cfgE', '📄⚙️');

  static UI_BUTTON = new ObjectExplorerObjectDescriptor('btn', '🔘');
  static UI_PAGE = new ObjectExplorerObjectDescriptor('page', '🎛️');
  static UI_TREE = new ObjectExplorerObjectDescriptor('tree', '📂');

  static DOCUMENT = new ObjectExplorerObjectDescriptor('', '📄');
  static CODEPRINT = new ObjectExplorerObjectDescriptor('cpp', '📄');

  static UNDECIDED = new ObjectExplorerObjectDescriptor('und', '❔');
  static GROUP = new ObjectExplorerObjectDescriptor('grp', '');
  static GROUPPROC = new ObjectExplorerObjectDescriptor('grpproc', '⇄');

  static RESOURCE = new ObjectExplorerObjectDescriptor('res', '📦');
  
  static _BIGCLASS_CFGOPT = 'cfgopt';
  static _BIGCLASS_HDL = 'hdl';
  static _BIGCLASS_UIO = 'uiobject';
  static _BIGCLASS_EVT = 'event';
  static _BIGCLASS_SEVT = 'sysevent';

  static _i_cfgopt = '⚙️';
  static _i_hdl = '👂';
  static _i_transmitter = '🛰️';
  static _i_uiobject = '🔘';
  static _i_event = '⚡';
  static _i_oeod_inst = '🔹';
  static _i_sysevent = '⭐';

  static _BIGCLASS = new Map([
    ['cfg', ObjectExplorerObjectDescriptor._BIGCLASS_CFGOPT],
    ['cfgE', ObjectExplorerObjectDescriptor._BIGCLASS_CFGOPT],
    ['evtSys', ObjectExplorerObjectDescriptor._BIGCLASS_SEVT],
    ['evt', ObjectExplorerObjectDescriptor._BIGCLASS_EVT],
    ['evtD', ObjectExplorerObjectDescriptor._BIGCLASS_EVT],
    ['hdl', ObjectExplorerObjectDescriptor._BIGCLASS_HDL],
    ['tra', 'transmitter'],
    ['btn', ObjectExplorerObjectDescriptor._BIGCLASS_UIO],
    ['page', ObjectExplorerObjectDescriptor._BIGCLASS_UIO],
    ['tree', ObjectExplorerObjectDescriptor._BIGCLASS_UIO],
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

class EventCommunicationPathInfo {
  static DIR_TRANSMIT = '🛰️'; //0;
  static DIR_ACCEPT = '📨'; //1;
  //static DIR_TWOWAY = '⇄'; //2;
  static DIR_DEFINITION = '📄'; //3;

  constructor(pluginName, instanceName, handlerName, direction, strictSwitch) {
    this.pluginName = pluginName;
    this.instanceName = instanceName;
    this.handlerName = handlerName;
    this.direction = direction;

    //this.openedAll = handlerName.startsWith('onET_');
    //this.openedAll = isEventHandlerOpened(instanceName, strictSwitch, '') || handlerName.startsWith('onET_');
    this.openedAll = handlerName.startsWith('onET_') || !instanceName;
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
