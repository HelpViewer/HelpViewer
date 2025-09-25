
class ColorThemeGet extends IEvent {
  constructor() {
    super();
  }
}

class ColorThemeSet extends IEvent {
  constructor() {
    super();
    this.name = null;
  }
}

class pColorTheme extends IPlugin {
  static EVT_CT_GET = ColorThemeGet.name;
  static EVT_CT_SET = ColorThemeSet.name;

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_STOREKEY = 'colorTheme';
    this.DEFAULT_KEY_CFG_COLORMODES = 'inStandard;inGray;inBlackWhite;inBWDuoColor;inSepia';
    this.DEFAULT_KEY_CFG_DEFAULT = 'inStandard';
  }

  init() {
    const T = this.constructor;
    const TI = this;

    TI.targetElement = document.body;
    TI.cfgCOLORMODES = TI.cfgCOLORMODES.split(';');
    
    const h_EVT_CT_GET = (data) =>
      data.result = TI.getCurrentColorMode();
    TI.eventDefinitions.push([T.EVT_CT_GET, ColorThemeGet, h_EVT_CT_GET]);

    const h_EVT_CT_SET = (data) =>
      TI.setColorMode(data.name);
    TI.eventDefinitions.push([T.EVT_CT_SET, ColorThemeSet, h_EVT_CT_SET]);

    TI.catalogizeEventCall(h_EVT_CT_GET, EventNames.UserConfigGet);
    TI.catalogizeEventCall(h_EVT_CT_SET, EventNames.UserConfigSet);

    super.init();
    const val = TI.getCurrentColorMode();
    setColorMode(val);
  }

  getCurrentColorMode() {
    const val = getUserConfigValue(this.cfgSTOREKEY) || this.cfgDEFAULT;
    return val;
  }

  setColorMode(val) {
    if (!val) {
      this._switchColorMode();
      return;
    }

    this.targetElement.className = val;
    setUserConfigValue(this.cfgSTOREKEY, val);
  }

  _switchColorMode() {
    const colorModes = this.cfgCOLORMODES;
    const idx = (colorModes.indexOf(this.targetElement.classList[0]) + 1) % colorModes.length;
    this.setColorMode(colorModes[idx]);
  }
}

Plugins.catalogize(pColorTheme);
