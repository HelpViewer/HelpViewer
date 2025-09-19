class puiButtonCustPackage extends puiButton {
  static KEY_CFG_IDCONTENT = 'IDCONTENT';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-CustPackage';
    this.DEFAULT_KEY_CFG_CAPTION = '📥';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_IDCONTENT = 'content';
  }

  init() {
    const T = this.constructor;
    const TI = this;

    TI.cfgIdContent = TI.config[T.KEY_CFG_IDCONTENT] || TI.DEFAULT_KEY_CFG_IDCONTENT;
    this.partsTree = '';
    this.partsList = [];
    storageSearch(STO_DATA, `plugins-config/${T.name}_${TI.aliasName}_tree.cfg`).then(x => {
      this.partsTree = x;
      this.partsList = x.split('\n').filter(x => x).map(x => x.trim());
    });

    super.init();

    const zip = _Storage.getKey(STO_DATA)?.storageO;
    hideButton(TI.button.id, typeof zip !== "string");
  }
  
  _buttonAction(evt) {
    const T = this.constructor;
    const TI = this;
    const treeId = 'partsTree';
    const downloadButtonID = 'DWNL-' + TI.aliasName;
    var tree = $(treeId);
    if (!tree) {
      this.keyAndSizes = new Map();
      const contentPane = $(TI.cfgIdContent);
      const divTemp = document.createElement("div");
      divTemp.id = 'd-' + newUID();

      const buttonInvert = document.createElement("button");
      buttonInvert.innerHTML = '🔄';
      buttonInvert.onclick = () => {
        Array.from($A('input', tree)).forEach(x => x.checked = !x.checked);
        this.checkboxChanged();
      }
      const buttonDownload = document.createElement("button");
      buttonDownload.innerHTML = TI.cfgCaption;
      buttonDownload.onclick = () => this._preparePackage(Array.from($A('input', tree)).filter(x => x.checked).map(x => x.id));
      buttonDownload.id = downloadButtonID;
      SetHeaderText(TI.cfgCaption + ' ' + _T('downP-CustPackage'));
      contentPane.innerHTML = `<ul id='${treeId}' class='tree'>${linesToHtmlTree(TI.partsTree, treeId)}</ul>`;
      contentPane.prepend(divTemp);
      showChapter(undefined, undefined, `:${T.name}/${getActiveLanguage()}/tree.md`, undefined, undefined, undefined, divTemp.id);
      contentPane.append(document.createElement("hr"));
      const spanSumId = 'spanSum';
      var spanSum = document.createElement("div");
      spanSum.id = spanSumId;
      spanSum.innerText = '0 kB';
      contentPane.append(spanSum);
      spanSum = $(spanSumId);
      contentPane.append(buttonInvert);
      contentPane.append(buttonDownload);
      tree = $(treeId);
      this.tree = tree;
      openSubtree(tree);
      $A('a', tree).forEach(a => {
        const plugins = TI.config[`P-${a.textContent}`].split(';').map(x => x.split(':')[0]).filter(x => x).map(x => `plugins/${x}.js`).join(';');
        const files = ([TI.config[`F-${a.textContent}`], plugins]).filter(x => x).join(';');

        this.keyAndSizes.set(a.textContent, {
          fileList : files,
          r : new Resource('', undefined, STO_DATA, files),
        });

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        const label = document.createElement("label");
        checkbox.id = a.textContent;
        checkbox.addEventListener("change", this.checkboxChanged.bind(this));
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode((TI.config[`I-${a.textContent}`] || '🧩') + ' ' + _T(a.textContent)));
        a.replaceWith(label);
      });

      var sizeSum = 0;

      Array.from($A('input', tree)).forEach(a => {
        this.waitForValue(this.keyAndSizes.get(a.id).r, '_fileLength').then(re => {
          const oneSize = valKiBs(re);
          a.parentNode.childNodes[1].nodeValue += ` (${oneSize} kB)`;
          sizeSum += oneSize;
          spanSum.innerText = roundToDecPlaces(sizeSum, 2) + ' kB';
        })
      });
    } else {
      $(downloadButtonID).click();
    }
  }

  _preparePackage(items) {
    const TI = this;
    const jszip = _Storage.getKey(STO_DATA)?.storageO;

    if (!jszip || typeof jszip === "string") {
      const contentPane = $(TI.cfgIdContent);
      contentPane.innerText = _T('SvcCantBeProvided');
      return;
    } else {
      log('W checked features', items);
      items = this.partsList.filter(x => !items.includes(x));
      log('W features for deletion', items);
      items = items.map(x => [TI.config[`P-${x}`], TI.config[`F-${x}`]]);
      var filesToExclude = [...new Set(items.map(x => x[1]).join(';').split(';').filter(x => x))];
      var pluginsToExclude = items.map(x => x[0]).join(';').split(';').filter(x => x);
      const pluginMaskToExclude = pluginsToExclude.filter(x => x.startsWith(':'));
      pluginsToExclude = pluginsToExclude.filter(x => !pluginMaskToExclude.includes(x));
      log('W lists to exclude (files, plugins, plugin ids)', filesToExclude, pluginsToExclude, pluginMaskToExclude);
  
      storageSearch(STO_DATA, FILENAME_LIST_JS_PLUGINS).then(x => {
        const sequence = x.trim().split('\n').map(x => x.trim()).map(x => x);
        var newSequence = sequence.filter(line => {
          return !pluginsToExclude.some(excl =>
            line === excl || line.startsWith(excl)
          );
        });

        newSequence = newSequence.filter(line => {
          return !pluginMaskToExclude.some(excl =>
            line.includes(excl)
          );
        });

        const newPluginsList = newSequence.map(x => x.split(':')[0]);
        const excludedByIds = sequence.map(x => x.split(':')[0]).filter(x => !newPluginsList.includes(x));

        const dependencyCheckKeys = Object.keys(TI.config).filter(x => x.startsWith('DE-'));
        const overallDependency = (TI.config['DE'] || '').split(';');
        pluginsToExclude.push(...excludedByIds);
        pluginsToExclude.push(...overallDependency);
        const overallDependenciesDeletions = dependencyCheckKeys.filter(x => !newPluginsList.includes(x.split('-')[1])).map(x => TI.config[x]).join(';').split(';');
        pluginsToExclude.push(...overallDependenciesDeletions);
        pluginsToExclude = pluginsToExclude.filter(x => x);

        newSequence = newSequence.filter(line => {
          return !pluginsToExclude.some(excl =>
            line === excl || line.startsWith(excl)
          );
        });
        
        pluginsToExclude = [...new Set(pluginsToExclude)];
        filesToExclude.push(...pluginsToExclude.map(x => `plugins/${x}.js`));
        filesToExclude.push(...pluginsToExclude.map(x => `${x}/`));
        filesToExclude = filesToExclude.filter(x => x);
        
        log('W Files in ZIP for deletion:', filesToExclude);
        log('W Old starting sequence:', sequence);
        log('W New starting sequence:', newSequence);

        jszip.remove(FILENAME_LIST_JS_PLUGINS);
        jszip.file(FILENAME_LIST_JS_PLUGINS, newSequence.join('\n'));
      }).then(x => {
        var masksToExclude = filesToExclude.filter(x => x.endsWith('/'));
        masksToExclude.push(...pluginsToExclude.map(x => `plugins-config/${x}_`));
        masksToExclude = masksToExclude.filter(x => x);
        this.deleteFromZip(jszip, filesToExclude.filter(x => !x.endsWith('/')), masksToExclude);
  
        // provide started download of result
        jszip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then(x => {
          const url = URL.createObjectURL(x);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'data.zip';
          a.setAttribute('data-param', url);
          a.target = '_blank';
          a.id = ID_DOWNLOADLINK;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);  
        });
      });

    }
  }

  deleteFromZip(zip, names = [], prefixes = []) {
    log('W ZIP cleaning ... (names, prefixes):', names, prefixes);
    log('W ZIP contents', Object.keys(zip.files));

    for (const fileName of Object.keys(zip.files)) {
      const isNameMatch = names.includes(fileName);
      const isPrefixMatch = prefixes.some(prefix => fileName.startsWith(prefix));
  
      if (isNameMatch || isPrefixMatch) {
        zip.remove(fileName);
        console.log('ZIP file deleted: ' + fileName);
      }
    }
  }

  checkChildren(target, checked) {
    const li = target.closest("li[role=treeitem]");
    if (!li) return;
    const childCheckboxes = li.querySelectorAll("ul input[type=checkbox]");
    childCheckboxes.forEach(cb => cb.checked = checked);
    // const detailsParent = event.target.closest('li');
    // if (detailsParent)
    //   Array.from($A('input', detailsParent)).forEach(x => x.checked = false);
  }

  checkboxChanged(event) {
    if (event) {
      if (event.target.checked) {
        // check children
        this.checkChildren(event.target, true);
        // check parents
        var li = event.target.closest("li[role=treeitem]");
        while (li) {
          const details = li.closest("details");
          if (!details) break;
      
          const parentLi = details.closest("li[role=treeitem]");
          if (!parentLi) break;
      
          const parentCheckbox = parentLi.querySelector("summary input[type=checkbox]");
          if (parentCheckbox) {
            parentCheckbox.checked = true;
          }
      
          li = parentLi;
        }
      } else {
        // uncheck siblings
        this.checkChildren(event.target, false);
      }
    }

    const selected = Array.from($A('input', this.tree)).filter(x => x.checked).map(x => x.id);
    const sum = [...this.keyAndSizes.entries()].reduce((acc, [key, value]) => 
      selected.includes(key) ? acc + value.r._fileLength : acc, 0);
    $('spanSum').innerText = valKiBs(sum) + ' kB';
  }

  waitForValue(resource, key) {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (resource[key] !== 0) {
          clearInterval(interval);
          resolve(resource[key]);
        }
      }, 100);
    });
  }
}

Plugins.catalogize(puiButtonCustPackage);
