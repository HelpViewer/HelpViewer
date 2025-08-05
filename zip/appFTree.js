/*S: Topic tree handling */
var idxTreeItem = 0;

function loadPageByTreeId(id, baseName) {
  const treeItem = document.getElementById(`${baseName}|${id}`);
  if (treeItem) {
    const syntheticClick = prepareFakeClick();
    treeItem.dispatchEvent(syntheticClick);
    idxTreeItem = id;
  }
  revealTreeItem(`${baseName}|${id}`);
}

function prepareFakeClick() {
  const syntheticClick = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window
  });
  return syntheticClick;
}

function revealTreeItem(id) {
  const el = document.getElementById(id);
  if (!el) return;

  var parent = el.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS')
      parent.open = true;
    
    parent = parent.parentElement;
  }
}

function openSubtree(parent) {
  parent.querySelectorAll("details").forEach(d => d.open = true);
}
/*E: Topic tree handling */