class puiButtonKeywordIndex extends puiButtonTabTree {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;

    this.DEFAULT_KEY_CFG_ID = 'downP-Glossary';
    this.DEFAULT_KEY_CFG_CAPTION = '📇';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    
    this.DEFAULT_KEY_CFG_TREEID = aliasName;
  }
  
  init() {
    super.init();

    const T = this.constructor;
    const TI = this;

    hideButton(TI.button.id, false);

    TI.catalogizeEventCall(TI._treeClick, EventNames.IndexFileGetKeywordData, EventIdDynamic);

    TI.catalogizeEventCall(T._requestIndexData, EventNames.IndexFileGetData, EventIdDynamic);
    
    TI.catalogizeEventCall(TI.init, EventNames.ElementSetVisibility);

    TI.catalogizeEventCall(TI.onETIndexFileLoaded, EventNames.ElementSetVisibility);
  }
  
  deInit() {
    super.deInit();
  }

  onETIndexFileLoaded(x) {
    const alias = this.aliasName;
      
    if (x.id != alias)
      return;

    hideButton(this.button.id, x.result);

    const target = $(this.cfgTreeId);
    this.constructor._requestIndexData(target, alias);
  }

  _preShowAction(evt) {
  }

  _treeClick(e) {
    e.event.preventDefault();

    const target = e.event.target;
    if (!target) return;

    var data = target.getAttribute('data-param');
    if (!data) return;

    const a = target.closest('a');
    if (!a) return;
  
    const path = data.substring(1).split(":");
    
    const p = document.createElement('span');
    a.parentNode.replaceChild(p, a);
    p.innerHTML = a.innerHTML;

    const reply = getIndexFileKeywordData(path[1], path[0]);
    const tree = linesToHtmlTree(reply, this.cfgTreeId + 'kwidx');
    p.innerHTML = tree;
    openSubtree(p);
  }

  _preStandardInit() {
    const fieldId = `${this.cfgTreeId}-i`;
    this.tab?.insertAdjacentHTML('afterbegin', `<input type="text" id="${fieldId}"></input>`);
    const field = $(fieldId);
    const T = this.constructor;
    field.addEventListener('keydown', T._handleEnterOnField.bind(this));
  }

  static _handleEnterOnField(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
    
      var id = event.target.id.replace('-i', '');
      const pane = $(id);
      
      if (!pane)
        return;

      var phrase = event.target.value;  
      phrase = textCleanupPhrase(phrase);
      
      const T = this.constructor;
      T._requestIndexData(pane, id, phrase);
    }
    
    if (event.key.substring(0, 3) === 'Esc') {
      event.target.value = "";
      event.target.blur(); 
    }
  }

  static _requestIndexData(target, alias, phrase = '', count = null) {
    const foundKeywords = getIndexFileData(alias, phrase, count);
    target.innerHTML = linesToHtmlTree(foundKeywords, alias);
  }
}
  
Plugins.catalogize(puiButtonKeywordIndex);
