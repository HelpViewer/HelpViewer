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
  
  _buttonAction(evt) {
    window.print();
  }

  onET_ButtonDump(evt) {
    const partial = super.onET_ButtonDump(evt);
    partial.handlerB = 'window.print();';
    return partial;
  }
}

Plugins.catalogize(puiButtonPrint);
