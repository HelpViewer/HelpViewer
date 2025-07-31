class puiButtonChangeLanguage extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.button = undefined;
    this.tab = undefined;
  }
  
  static eventDefinitions = [];
  
  static KEY_CFG_ID = 'ID';
  static KEY_CFG_CAPTION = 'CAPTION';
  static KEY_CFG_TARGET = 'TARGET';
  static KEY_CFG_TEMPLATE = 'LINKTEMPLATE';

  static LANGLINKS_PREFIX = 'lng';
  
  init() {
    const T = puiButtonChangeLanguage;
    const TI = this;
  
    const cfgId = TI.config[T.KEY_CFG_ID] || 'downP-ChangeLanguage';
    const cfgCaption = TI.config[T.KEY_CFG_CAPTION] || '🌐';
    const cfgTarget = TI.config[T.KEY_CFG_TARGET] || UI_PLUGIN_SIDEBAR;
    const cfgTemplate = TI.config[T.KEY_CFG_TEMPLATE] || "<li><a class='langLink' href='' id='%ID%' title='%A%'>%A%</a></li>";

    const reply = uiAddButton(cfgId, cfgCaption, cfgTarget, H_BUTTON_WITH_TAB);
    TI.button = reply[0];
    TI.tab = reply[1];
    const langTab = uiAddTreeView('langList', TI.tab);

    const _buttonAction = (evt) => {
      var langsFromHelp = (configGetValue(CFG_KEY_Languages, '') || '')?.split(';') || [];
      var languages = getLanguagesList(langsFromHelp);

      languages.then((languages) => {
        langTab.innerHTML = '';
      
        for (var i = 0; i < languages.length; i++) {
          const parts = languages[i].split("|");
          const alias = parts[0]?.trim() || "";
          const name = parts[1]?.trim() || "";
          const linkSrc = cfgTemplate.replaceAll('%ID%', `${T.LANGLINKS_PREFIX}|${name}`).replaceAll('%A%', alias);
          langTab.innerHTML += linkSrc;
        }  
      });
      showSidebarTab(TI?.tab?.id);
    }
    registerOnClick(TI.button.id, _buttonAction);
    registerOnClick(T.LANGLINKS_PREFIX, (e) => {
      loadLocalization(e.elementIdVal);
    });
  
    super.init();
  }
  
  deInit() {
    this.button?.remove();
    this.tab?.remove();
  
    super.deInit();
  }
}
  
Plugins.catalogize(puiButtonChangeLanguage);
