class puiButtonCustPackage extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-CustPackage';
    this.DEFAULT_KEY_CFG_CAPTION = '📥';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
  }
  
  _buttonAction(evt) {
  }
}

Plugins.catalogize(puiButtonCustPackage);
