/*S: Topic tree handling */
var idxTreeItem = 0;

function loadPageByTreeId(id) {
  const treeItem = document.getElementById(N_P_TREEITEM + id);
  if (treeItem) {
    const syntheticClick = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    });
    treeItem.dispatchEvent(syntheticClick);
    idxTreeItem = id;
  }
  revealTreeItem(N_P_TREEITEM + id);
}

function revealTreeItem(id) {
  const el = document.getElementById(id);
  if (!el) return;

  var parent = el.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') {
      parent.open = true;
    }
    parent = parent.parentElement;
  }
}

function openSubtree(parent) {
  parent.querySelectorAll("details").forEach(d => d.open = true);
}
/*E: Topic tree handling */