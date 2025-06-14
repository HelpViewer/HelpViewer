/*S: Feature: Right top panel, page navigation buttons */
function newNavigation(baseName, getId, treeBaseName = N_P_TREEITEM) {
  var navL = document.getElementById(`${baseName}-left`);
  var navT = document.getElementById(`${baseName}-top`);
  var navR = document.getElementById(`${baseName}-right`);
  
  function navPrev(event) {
    event.preventDefault();
    var next = getId()-1;
    loadPageByTreeId(next, treeBaseName);
    updateNavButtons(next);
  }
  
  function navNext(event) {
    event.preventDefault();
    var next = (getId() || 0)+1;
    loadPageByTreeId(next, treeBaseName);
    updateNavButtons(next);
  }
  
  function navTop(event) {
    event.preventDefault();
    const treeItem = document.getElementById(treeBaseName + '|' + getId());
    const upId = parseInt(treeItem.parentElement.parentElement.parentElement.querySelector('summary > a').id.slice(treeBaseName.length + 1));
    loadPageByTreeId(upId, treeBaseName);
    updateNavButtons(upId);
  }
  
  function updateNavButtons(i) {
    var i = parseInt(i);
    var indexPrev = i - 1;
    var indexNext = i + 1;
    const prevTreeItem = document.getElementById(treeBaseName + '|' + indexPrev);
    const nextTreeItem = document.getElementById(treeBaseName + '|' + indexNext);

    if (prevTreeItem)
      navL.classList.remove(C_HIDDENC);
    else
      navL.classList.add(C_HIDDENC);
    
    if (nextTreeItem)
      navR.classList.remove(C_HIDDENC);
    else
      navR.classList.add(C_HIDDENC);

    if (i <= 1)
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