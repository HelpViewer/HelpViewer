class puiButtonChangeLanguage extends puiButtonTab {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ChangeLanguage';
    this.DEFAULT_KEY_CFG_CAPTION = '🌐';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_TEMPLATE = "<li><a class='langLink' href='' id='%ID%' title='%A%'>%A%</a></li>";
    this.DEFAULT_KEY_CFG_LINKPREFIX = 'lng';
  }
  
  init() {
    super.init();
    const TI = this;

    this.langTab = uiAddTreeView('langList', TI.tab);

    registerOnClick(TI.cfgLINKPREFIX, (e) => {
      loadLocalization(e.elementIdVal);
      e.event.preventDefault();
    });

    TI.catalogizeEventCall(TI.init, EventNames.ClickHandlerRegister);
    TI.catalogizeEventCall(TI.init, EventNames.LOC_LOAD);
  }
  
  _preShowAction(evt) {
    var langsFromHelp = (configGetValue(CFG_KEY_Languages, '') || '')?.split(';') || [];
    var languages = getLanguagesList(langsFromHelp);

    languages.then((languages) => {
      this.langTab.innerHTML = '';
    
      for (var i = 0; i < languages.length; i++) {
        const parts = languages[i].split("|");
        const alias = parts[0]?.trim() || "";
        const name = parts[1]?.trim() || "";
        const linkSrc = this.cfgTEMPLATE.replaceAll('%ID%', `${this.cfgLINKPREFIX}|${name}`).replaceAll('%A%', alias);
        this.langTab.innerHTML += linkSrc;
      }  
    });
  }
}
  
Plugins.catalogize(puiButtonChangeLanguage);
