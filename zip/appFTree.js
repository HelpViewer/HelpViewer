/*S: Topic tree handling */
var idxTreeItem = 0;

function loadPageByTreeId(id, baseName) {
  const key = `${baseName}|${id}`;
  const treeItem = $(key);
  if (treeItem) {
    idxTreeItem = id;
    treeItem.click();
    // showChapterA(undefined, treeItem);
    revealTreeItem(key);
  }
}

function revealTreeItem(id) {
  const el = $(id);
  if (!el) return;

  var parent = el.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS')
      parent.open = true;
    
    parent = parent.parentElement;
  }
}

function openSubtree(parent) {
  $A('details', parent).forEach(d => d.open = true);
}
/*E: Topic tree handling */