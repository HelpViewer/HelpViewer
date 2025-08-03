class puiButtonChangeLanguage extends puiButtonTab {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ChangeLanguage';
    this.DEFAULT_KEY_CFG_CAPTION = '🌐';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }
  
  static KEY_CFG_TEMPLATE = 'LINKTEMPLATE';
  static LANGLINKS_PREFIX = 'lng';
  
  init() {
    super.init();
    const T = this.constructor;
    const TI = this;
  
    this.cfgTemplate = TI.config[T.KEY_CFG_TEMPLATE] || "<li><a class='langLink' href='' id='%ID%' title='%A%'>%A%</a></li>";
    this.langTab = uiAddTreeView('langList', TI.tab);

    registerOnClick(T.LANGLINKS_PREFIX, (e) => {
      loadLocalization(e.elementIdVal);
      e.event.preventDefault();
    });
  }
  
  deInit() {
    super.deInit();
  }

  _preShowAction(evt) {
    const T = this.constructor;
    var langsFromHelp = (configGetValue(CFG_KEY_Languages, '') || '')?.split(';') || [];
    var languages = getLanguagesList(langsFromHelp);

    languages.then((languages) => {
      this.langTab.innerHTML = '';
    
      for (var i = 0; i < languages.length; i++) {
        const parts = languages[i].split("|");
        const alias = parts[0]?.trim() || "";
        const name = parts[1]?.trim() || "";
        const linkSrc = this.cfgTemplate.replaceAll('%ID%', `${T.LANGLINKS_PREFIX}|${name}`).replaceAll('%A%', alias);
        this.langTab.innerHTML += linkSrc;
      }  
    });
  }
}
  
Plugins.catalogize(puiButtonChangeLanguage);
