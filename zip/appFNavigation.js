/*S: Feature: Right top panel, page navigation buttons */
const navL = document.getElementById('nav-left');
const navT = document.getElementById('nav-top');
const navR = document.getElementById('nav-right');

function navPrev(event) {
  event.preventDefault();
  loadPageByTreeId(idxTreeItem-1);
}

function navNext(event) {
  event.preventDefault();
  loadPageByTreeId(idxTreeItem+1);
}

function navTop(event) {
  event.preventDefault();
  const treeItem = document.getElementById(N_P_TREEITEM + idxTreeItem);
  const upId = parseInt(treeItem.parentElement.parentElement.parentElement.querySelector('summary > a').id.slice(5));
  loadPageByTreeId(upId);
}

function updateNavButtons(i) {
  if (i >= 0) {
    navL.classList.remove(C_HIDDENC);
    navT.classList.remove(C_HIDDENC);
    navR.classList.remove(C_HIDDENC);
  } else {
    navL.classList.add(C_HIDDENC);
    navT.classList.add(C_HIDDENC);
    navR.classList.add(C_HIDDENC);
  }
  
  const currentTreeItem = document.getElementById(N_P_TREEITEM + i);
  const nextTreeItem = document.getElementById(N_P_TREEITEM + (i + 1));
  
  if (i == 0) {
    navL.classList.add(C_HIDDENC);
    navT.classList.add(C_HIDDENC);
  }
  
  if (nextTreeItem == null) {
    navR.classList.add(C_HIDDENC);
  }
}
/*E: Feature: Right top panel, page navigation buttons */

function scrollToAnchor(id) {
  const targetO = document.getElementById(id);
  if (targetO) {
    targetO.scrollIntoView({ behavior: 'smooth' });
  }
}