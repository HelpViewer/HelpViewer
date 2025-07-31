class puiButtonPrint extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.button = undefined;
  }

  static eventDefinitions = [];

  static KEY_CFG_ID = 'ID';
  static KEY_CFG_CAPTION = 'CAPTION';
  static KEY_CFG_TARGET = 'TARGET';

  init() {
    const T = puiButtonPrint;
    const _buttonAction = (evt) => window.print();
  
    const cfgId = this.config[T.KEY_CFG_ID] || 'printBtn';
    const cfgCaption = this.config[T.KEY_CFG_CAPTION] || '🖨️';
    const cfgTarget = this.config[T.KEY_CFG_TARGET] || UI_PLUGIN_HEADER;
    this.button = uiAddButton(cfgId, cfgCaption, cfgTarget, _buttonAction);

    super.init();
  }

  deInit() {
    this.button?.remove();

    super.deInit();
  }
}

Plugins.catalogize(puiButtonPrint);
