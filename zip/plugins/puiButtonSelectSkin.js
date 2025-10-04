class puiButtonSelectSkin extends puiButtonSelect {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-selSkin';
    this.DEFAULT_KEY_CFG_CAPTION = '🌈';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_STOREKEY = 'skin';
    this.DEFAULT_KEY_CFG_DEFAULTSKIN = '';

    this.dirStyles = 'styles';
    this.idCSS = 'css-skin';
  }

  async init() {
    super.init();

    const TI = this;
    TI.activeSkin = getUserConfigValue(TI.cfgSTOREKEY) || TI.cfgDEFAULTSKIN;

    const styles = (await storageGetSubdirs(STO_DATA, TI.dirStyles)).map(x => x.split('.')[0]);
    styles.unshift('');
    appendComboBoxItems(TI.select, styles, TI.activeSkin);
  }

  deInit() {
    super.deInit();
    $(this.idCSS)?.remove();
  }

  _handle(e) {
    const newVal = e.target.options[e.target.selectedIndex].text;
    setUserConfigValue(this.cfgSTOREKEY, newVal);
    this._setStyle(newVal);
  }

  async _setStyle(name) {
    $(this.idCSS)?.remove();
    if (!name)
      return;
    const styleData = await storageSearch(STO_DATA, `${this.dirStyles}/${name}.css`);
    appendCSS(this.idCSS, styleData);
    $(ID_MAINCSS_PLUS)?.remove();
    this.activeSkin = name;
  }

  onET_UserDataFileLoaded(evt) {
    if (!$(this.idCSS))
      this._setStyle(this.activeSkin);
  }
}

Plugins.catalogize(puiButtonSelectSkin);
