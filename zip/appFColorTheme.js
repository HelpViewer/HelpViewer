/*S: Feature: Set color theme */
const ColorTheme = (() => {
  var KEY_LS_COLORTHEME = "colorTheme";
  
  // reimplement yourself
  var colorModes = ["inStandard", "inGray", "inBlackWhite", "inBWDuoColor"];
  
  var targetElement = document.body;

  function init() {
    const val = getCurrentColorMode();
    setColorMode(val);
  }

  function getCurrentColorMode() {
    const val = getUserConfigValue(KEY_LS_COLORTHEME) || 'inStandard';
    return val;
  }
  
  function switchColorMode() {
    const base = targetElement;
    const idx = (colorModes.indexOf(base.classList[0]) + 1) % colorModes.length;
    setColorMode(colorModes[idx]);
  }
  
  function setColorMode(val) {
    const base = targetElement;
    base.className = val;
    setUserConfigValue(KEY_LS_COLORTHEME, val);
  }

  //, KEY_LS_COLORTHEME, colorModes, targetElement
  return { init, switchColorMode, setColorMode, getCurrentColorMode };
})();

window.ColorTheme = ColorTheme;
/*E: Feature: Set color theme */