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

    const TI = this;

    hideButton(TI.button.id, false);
  }
  
  onETIndexFileLoaded(x) {
    const alias = this.aliasName;
      
    if (x.id != alias)
      return;

    hideButton(this.button.id, x.result);

    const target = $(this.cfgTREEID);
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
    const tree = linesToHtmlTree(reply, this.cfgTREEID + 'kwidx');
    p.innerHTML = tree;
    openSubtree(p);
  }

  _preStandardInit() {
    const fieldId = `${this.cfgTREEID}-i`;
    this.tab?.insertAdjacentHTML('afterbegin', `<input type="text" id="${fieldId}"></input>`);
    const field = $(fieldId);
    const T = this.constructor;
    field.addEventListener('keydown', T._handleEnterOnField.bind(this));
    this.searchField = field;
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
    let phraseParts = !phrase ? [''] : phrase.split(' ').map(p => p.trim()).filter(p => p !== '');
    let foundKeywords = [...new Set(phraseParts.flatMap(phrase => getIndexFileData(alias, phrase, count)))];
    foundKeywords = groupBy(foundKeywords.join('\n').split('\n'), (x) => x);
    target.innerHTML = linesToHtmlTree(Object.keys(foundKeywords).join('\n'), alias);
  }
}
  
Plugins.catalogize(puiButtonKeywordIndex);
