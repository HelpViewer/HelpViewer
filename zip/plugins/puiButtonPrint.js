class puiButtonPrint extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'printBtn';
    this.DEFAULT_KEY_CFG_CAPTION = '🖨️';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_HEADER;
  }

  init() {
    super.init();
    this.button.classList.add(C_HIDDENCPRESMODE);
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    window.print();
  }
}

Plugins.catalogize(puiButtonPrint);
