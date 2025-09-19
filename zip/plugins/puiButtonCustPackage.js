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
    storageSearch(STO_DATA, `plugins-config/${T.name}_${TI.aliasName}_tree.cfg`).then(x => {
      this.partsTree = x;
    });

    super.init();
  }
  
  _buttonAction(evt) {
    const TI = this;
    const treeId = 'partsTree';
    const downloadButtonID = 'DWNL-' + TI.aliasName;
    var tree = $(treeId);
    if (!tree) {
      this.keyAndSizes = new Map();
      const contentPane = $(TI.cfgIdContent);
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
      setHeader(_T('downP-CustPackage'));
      contentPane.innerHTML = `<ul id='${treeId}' class='tree'>${linesToHtmlTree(TI.partsTree, treeId)}</ul>`;
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
          spanSum.innerText = sizeSum + ' kB';
        })
      });
    } else {
      $(downloadButtonID).click();
    }
  }

  _preparePackage(items) {
    alert('Ahoj');
    log('E CHCK', items);
  }

  checkboxChanged(event) {
    if (event) {
      if (event.target.checked) {
        // check parents
        var base = event.target;
        while (base) {
          const detailsParent = base.closest('li');
          const checkbox = base.closest('input');

          if (checkbox) {
            //base = undefined; //TML
            checkbox.checked = true;
            base = detailsParent.parentElement.parentElement.firstElementChild;
            base = $O('input', base);
          } else {
            base = undefined;
          }

          if (checkbox == base)
            base = undefined;
        }
      } else {
        // uncheck siblings
        const detailsParent = event.target.closest('li');
        if (detailsParent)
          Array.from($A('input', detailsParent)).forEach(x => x.checked = false);
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
