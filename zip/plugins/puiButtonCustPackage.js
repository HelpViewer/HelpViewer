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
    const treeId = 'partsTree';
    var tree = $(treeId);
    if (!tree) {
      const contentPane = $(this.cfgIdContent);
      const buttonInvert = document.createElement("button");
      buttonInvert.innerHTML = '🔄';
      buttonInvert.onclick = () => Array.from($A('input', tree)).forEach(x => x.checked = !x.checked);
      setHeader(_T('downP-CustPackage'));
      contentPane.innerHTML = `<ul id='${treeId}' class='tree'>${linesToHtmlTree(this.partsTree, treeId)}</ul>`;
      contentPane.append(buttonInvert);
      tree = $(treeId);
      openSubtree(tree);
      $A('a', tree).forEach(a => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        const label = document.createElement("label");
        checkbox.id = a.textContent;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode((this.config[`I-${a.textContent}`] || '🧩') + ' ' + _T(a.textContent)));
        a.replaceWith(label);
      });  
    } else {
      log('E CHCK', Array.from($A('input', tree)).filter(x => x.checked).map(x => x.id));
    }
  }
}

Plugins.catalogize(puiButtonCustPackage);
