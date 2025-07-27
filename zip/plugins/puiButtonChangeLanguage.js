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
  
  init() {
    const T = puiButtonChangeLanguage;
    const TI = this;
  
    const cfgId = TI.config[T.KEY_CFG_ID] || 'downP-ChangeLanguage';
    const cfgCaption = TI.config[T.KEY_CFG_CAPTION] || '🌐';
    const cfgTarget = TI.config[T.KEY_CFG_TARGET] || UI_PLUGIN_SIDEBAR;

    const reply = uiAddButton(cfgId, cfgCaption, cfgTarget, H_BUTTON_WITH_TAB);
    TI.button = reply[0];
    TI.tab = reply[1];
    const langTab = uiAddTreeView('langList_NEW', TI.tab);

    const _buttonAction = (evt) => {
      alert('async1');
      var langsFromHelp = (configGetValue(CFG_KEY_Languages, '') || '')?.split(';') || [];
      alert('async2');
      var languages = getLanguagesList(langsFromHelp);
      languages.then((languages) => {
        alert('async3');
        langTab.innerHTML = '';
      
        for (var i = 0; i < languages.length; i++) {
          alert('async4: ' + i.toString());
          const parts = languages[i].split("|");
          const alias = parts[0]?.trim() || "";
          const name = parts[1]?.trim() || "";
          langTab.innerHTML += `<li><a class='langLink' href="" id="${LANGLINKS_PREFIX}${name}" title="${alias}">${alias}</a></li>`;
        }  
      });
      //alert('btn');
      // (async () => {



      //   // var languages = getLanguagesList();
      //   // alert('xxx ' + languages);

      //   // languages.then(async (x) => {
      //   //   alert('awaitnute: ' + x);

      //   // } );
      // })();
      showSidebarTab(TI?.tab?.id);
    }
    registerOnClick(TI.button.id, _buttonAction);
  
    super.init();
  }
  
  deInit() {
    this.button?.remove();
    this.tab?.remove();
  
    super.deInit();
  }
}
  
Plugins.catalogize(puiButtonChangeLanguage);
