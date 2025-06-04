/*S: Feature: Set color theme */
const KEY_LS_COLORTHEME = "colorTheme";

// reimplement yourself
const colorModes = ["inStandard", "inGray", "inBlackWhite", "inBWDuoColor"];

const colorTheme = localStorage.getItem(KEY_LS_COLORTHEME) || 'inStandard';
setColorMode(colorTheme);

function switchColorMode() {
  const base = document.body;
  const idx = (colorModes.indexOf(base.classList[0]) + 1) % colorModes.length;
  setColorMode(colorModes[idx]);
}

function setColorMode(val) {
  const base = document.body;
  base.className = val;
  localStorage.setItem(KEY_LS_COLORTHEME, val);
}
/*E: Feature: Set color theme */