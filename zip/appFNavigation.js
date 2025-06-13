/*S: Feature: Right top panel, page navigation buttons */
function newNavigation(baseName, idxTreeItem, treeBaseName = N_P_TREEITEM) {
  var navL = document.getElementById(`${baseName}-left`);
  var navT = document.getElementById(`${baseName}-top`);
  var navR = document.getElementById(`${baseName}-right`);
  const idxT = idxTreeItem;
  
  function navPrev(event) {
    event.preventDefault();
    loadPageByTreeId(idxT()-1);
  }
  
  function navNext(event) {
    event.preventDefault();
    loadPageByTreeId(idxT()+1);
  }
  
  function navTop(event) {
    event.preventDefault();
    const treeItem = document.getElementById(treeBaseName + idxT());
    const upId = parseInt(treeItem.parentElement.parentElement.parentElement.querySelector('summary > a').id.slice(treeBaseName.length));
    loadPageByTreeId(upId);
  }
  
  function updateNavButtons(i) {
    const prevTreeItem = document.getElementById(treeBaseName + (i - 1));
    const nextTreeItem = document.getElementById(treeBaseName + (i + 1));

    if (prevTreeItem)
      navL.classList.remove(C_HIDDENC);
    else
      navL.classList.add(C_HIDDENC);
    
    if (nextTreeItem)
      navR.classList.remove(C_HIDDENC);
    else
      navR.classList.add(C_HIDDENC);

    if (i <= 0)
      navT.classList.add(C_HIDDENC);
    else
      navT.classList.remove(C_HIDDENC);
  }

  return {
    navPrev,
    navNext,
    navTop,
    updateNavButtons
  }
}
/*E: Feature: Right top panel, page navigation buttons */

function scrollToAnchor(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToAnchorE(event, id) {
  event.preventDefault();
  scrollToAnchor(id);
}