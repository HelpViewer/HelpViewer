/*S: Feature: Sidebar hide/show (sidebar switching) */
const C_TORIGHT = 'toright';

const KEY_LS_SIDEBARVISIBLE = "sidebarVisible";
const sidebarVisible = localStorage.getItem(KEY_LS_SIDEBARVISIBLE) || 1;

const KEY_LS_SIDEBARSIDE = "sidebarSide";
const sidebarSide = localStorage.getItem(KEY_LS_SIDEBARSIDE) || 0;

const sidebar = document.getElementById('sidebar');
const showBtn = document.getElementById('showBtn');
const container = document.getElementById('container');
const containerMain = document.getElementById('main');

if (sidebarVisible == 0 && sidebar) toggleSidebar();

if (sidebarSide == 0 && container) toggleSidebarSide();

function toggleSidebar() {
  if (sidebar.classList.contains(C_HIDDENC)) {
    sidebar.classList.remove(C_HIDDENC);
    showBtn.classList.add(C_HIDDENC);
    localStorage.setItem(KEY_LS_SIDEBARVISIBLE, 1);
  } else {
    sidebar.classList.add(C_HIDDENC);
    showBtn.classList.remove(C_HIDDENC);
    localStorage.setItem(KEY_LS_SIDEBARVISIBLE, 0);
  }
}

function toggleSidebarSide() {
  if (container.classList.contains(C_TORIGHT)) {
    container.classList.remove(C_TORIGHT);
    localStorage.setItem(KEY_LS_SIDEBARSIDE, 1);
  } else {
    container.classList.add(C_TORIGHT);
    localStorage.setItem(KEY_LS_SIDEBARSIDE, 0);
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

/*S: Feature: Sidebar tabs handling */
function showSidebarTab(id) {
  const tab = document.getElementById(id);
  
  if (tab) {
    Array.from(tab.parentElement.children).forEach(child => {
      child.classList.add(C_HIDDENC);
    });
  
    tab.classList.remove(C_HIDDENC);  
  }
}
/*E: Feature: Sidebar tabs handling */

function hideButton(btnid) {
  const button = document.getElementById(btnid);
  if (button)
    button.classList.add(C_HIDDENC);

  recomputeButtonPanel(button);
}

function recomputeButtonPanel(button)
{
  const multilineCSS = 'multi-linePanel';
  const panel = button.parentElement;
  const len = panel.querySelectorAll(`:scope > :not(.${C_HIDDENC})`).length;

  if (len <= 9) {
    panel.classList.remove(multilineCSS);
  } else {
    panel.classList.add(multilineCSS);
  }
}
