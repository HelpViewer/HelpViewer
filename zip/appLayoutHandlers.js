/*S: Feature: Sidebar hide/show (sidebar switching) */
const KEY_LS_SIDEBARVISIBLE = "sidebarVisible";
const sidebarVisible = localStorage.getItem(KEY_LS_SIDEBARVISIBLE) || 1;

const sidebar = document.getElementById('sidebar');
const showBtn = document.getElementById('showBtn');

if (sidebarVisible == 0 && sidebar) toggleSidebar();

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
  
  Array.from(tab.parentElement.children).forEach(child => {
    child.classList.add(C_HIDDENC);
  });

  tab.classList.remove(C_HIDDENC);
}
/*E: Feature: Sidebar tabs handling */