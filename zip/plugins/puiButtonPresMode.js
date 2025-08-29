class puiButtonPresMode extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-TogglePresMode';
    this.DEFAULT_KEY_CFG_CAPTION = '📽';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.presModeCSSAddName = 'presModeCSSAdd';
  }

  init() {
    super.init();

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
      } else {
        $(this.presModeCSSAddName)?.remove();
        toggleSidebar(true);
      }
    });
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    const presModeCSSAdd = `.${C_HIDDENCPRESMODE} { display: none; }`;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
      toggleSidebar(false);
      appendCSS(this.presModeCSSAddName, presModeCSSAdd);
    }
  }
}

Plugins.catalogize(puiButtonPresMode);
