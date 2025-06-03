const colorModes = ["inStandard", "inGray", "inBlackWhite", "inBWDuoColor"];

var dataPath = '';
var pagePath = '';

function LoadURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  dataPath = urlParams.get('d');
  pagePath = urlParams.get('p');
  idxTreeItem = parseInt(urlParams.get('id')) || 0;
}

var msgNoData = '';

LoadURLParameters();
updateNavButtons(idxTreeItem);

const tree = document.getElementById('tree');

window.addEventListener('popstate', () => {
  LoadURLParameters();

  if (typeof dataPath !== 'string' || dataPath.trim() === '') {
    dataPath = FILENAME_DEFAULT_HELPFILE;
  }

  getPathData(pagePath, pagePath);
  updateNavButtons(idxTreeItem);
});

contentPane.addEventListener('click', function(event) {
  const link = event.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');

  if (href.startsWith('http') || href.startsWith('//')) return;

  event.preventDefault();
  history.pushState({}, '', href);
  
  LoadURLParameters();
  getPathData(pagePath, pagePath);
});

var archive;

if (!dataPath || !pagePath) {
  SetHeaderText('Select item from left');
}

if (!dataPath) {
  console.log('Data file has not been specified. Use ?d= and its path in URI. Used default file name.');
  dataPath = FILENAME_DEFAULT_HELPFILE;
  msgNoData = 'Data file has not been specified. Use <b>?d=</b> followed by the file path in the URI. The default file name <b>' + dataPath + '</b> was used instead. If the left panel is empty, the file <b>' + dataPath + '</b> probably does not exist in the viewer\'s local directory. As a next step, check <b>p=</b> for a valid path inside the help ZIP archive.';
  contentPane.innerHTML = msgNoData;
}

if (dataPath) {
  (async () => {
    // load tree data
    archive = await loadZipFromUrl(dataPath);
    const srcTreeData = await searchArchiveForFile(FILENAME_TREE, archive);
    tree.innerHTML = linesToHtmlTree(srcTreeData);
    revealTreeItem(N_P_TREEITEM + idxTreeItem);
    updateNavButtons(idxTreeItem);
  
    if (pagePath) {
      getPathData(pagePath, pagePath);
    }
  })();
}

if (!pagePath) {
  // read default filename (1st topic)
  pagePath = FILENAME_1STTOPIC;
  var txt = contentPane.innerHTML;
  getPathData(pagePath, pagePath);
}

function checkSidebarWidth() {
  if (sidebar.offsetWidth / window.innerWidth > 0.5) {
    sidebar.classList.add("too-wide");
  } else {
    sidebar.classList.remove("too-wide");
  }
}

window.addEventListener("resize", checkSidebarWidth);
window.addEventListener("load", checkSidebarWidth);

/*S: Topic renderer logic integration */
function convertRelativePathToViewerURI(val) {
  return `?d=${dataPath}&p=${encodeURIComponent(val)}&id=${encodeURIComponent(idxTreeItem)}`;
}

function setSearchParams(url, path, i) {
  url.searchParams.set('p', path);
  url.searchParams.set('id', i);
}
/*E: Topic renderer logic integration */