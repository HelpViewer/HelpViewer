
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
  }

  static eventDefinitions = [];

  init() {
    const T = this.constructor;
    const h_EVT_CT_GET = (data) =>
      data.result = T.ColorTheme.getCurrentColorMode();
    T.eventDefinitions.push([T.EVT_CT_GET, ColorThemeGet, h_EVT_CT_GET]);

    const h_EVT_CT_SET = (data) =>
      T.ColorTheme.setColorMode(data.name);
    T.eventDefinitions.push([T.EVT_CT_SET, ColorThemeSet, h_EVT_CT_SET]);

    super.init();
    T.ColorTheme.init();
  }

  deInit() {
    super.deInit();
  }

  /*S: Feature: Set color theme */
  static ColorTheme = (() => {
    var KEY_LS_COLORTHEME = "colorTheme";
    
    // reimplement yourself
    var colorModes = ["inStandard", "inGray", "inBlackWhite", "inBWDuoColor"];
    var defaultColorTheme = colorModes[0];
    
    var targetElement = document.body;
  
    function init() {
      const val = getCurrentColorMode();
      setColorMode(val);
    }
  
    function getCurrentColorMode() {
      const val = getUserConfigValue(KEY_LS_COLORTHEME) || defaultColorTheme;
      return val;
    }
    
    function switchColorMode() {
      const base = targetElement;
      const idx = (colorModes.indexOf(base.classList[0]) + 1) % colorModes.length;
      setColorMode(colorModes[idx]);
    }
    
    function setColorMode(val) {
      if (!val) {
        switchColorMode();
        return;
      }
  
      const base = targetElement;
      base.className = val;
      setUserConfigValue(KEY_LS_COLORTHEME, val);
    }
  
    return { init, switchColorMode, setColorMode, getCurrentColorMode };
  })();
  /*E: Feature: Set color theme */
}

Plugins.catalogize(pColorTheme);
