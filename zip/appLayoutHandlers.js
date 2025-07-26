/*S: Feature: Sidebar hide/show (sidebar switching) */
const C_TORIGHT = 'toright';

const KEY_LS_SIDEBARSIDE = "sidebarSide";
const sidebarSide = getUserConfigValue(KEY_LS_SIDEBARSIDE) || 0;

const sidebar = document.getElementById('sidebar');
const showBtn = document.getElementById('showBtn');
const container = document.getElementById('container');

function toggleVisibility(target, newVal) {
  if (!target) return;
  const currentlyHidden = target.classList.contains(C_HIDDENC);
  var newValue = newVal;

  if (newValue == undefined)
    newValue = currentlyHidden;

  if (newValue) {
    if (currentlyHidden)
      target.classList.remove(C_HIDDENC);
  } else {
    if (!currentlyHidden)
      target.classList.add(C_HIDDENC);
  }

  return newValue;
}

if (sidebarSide == 0 && container) toggleSidebarSide();

function toggleSidebarSide() {
  if (container.classList.contains(C_TORIGHT)) {
    container.classList.remove(C_TORIGHT);
    setUserConfigValue(KEY_LS_SIDEBARSIDE, '1');
  } else {
    container.classList.add(C_TORIGHT);
    setUserConfigValue(KEY_LS_SIDEBARSIDE, '0');
  }
}
/*E: Feature: Sidebar hide/show (sidebar switching) */

/*S: Feature: Switch fullscreen */
function switchFullScreen() {
  document.fullscreenElement 
    ? document.exitFullscreen() 
    : document.documentElement.requestFullscreen();
}
/*E: Feature: Switch fullscreen */

function hideButton(btnid) {
  const button = document.getElementById(btnid);
  if (button)
    button.classList.add(C_HIDDENC);

  recomputeButtonPanel(button);
}

function recomputeButtonPanel(button)
{
  if (!button) return;
  
  const multilineCSS = 'multi-linePanel';
  const panel = button.parentElement;
  const len = panel.querySelectorAll(`:scope > :not(.${C_HIDDENC})`).length;

  if (len <= 9) {
    panel.classList.remove(multilineCSS);
  } else {
    panel.classList.add(multilineCSS);
  }
}
