const PAR_NAME_DOC = 'd'; // Help file path
const PAR_NAME_PAGE = 'p'; // chapter page path

const LK_HEADING_SELECT_LEFT = 'HEADING_SELECT_LEFT';
const LK_MSG_NODATA = 'MSG_NODATA';

function LoadURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  dataPath = urlParams.get(PAR_NAME_DOC);
  pagePath = urlParams.get(PAR_NAME_PAGE) || FILENAME_1STTOPIC;
  idxTreeItem = parseInt(urlParams.get(PAR_NAME_ID)) || 0;
}

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

var languages = getLanguagesList();

loadLocalization(activeLanguage).then(() => {
  languages.then((languages) => {
    langTab.innerHTML = '';
  
    for (var i = 0; i < languages.length; i++) {
      const parts = languages[i].split("|");
      const alias = parts[0]?.trim() || "";
      const name = parts[1]?.trim() || "";
      langTab.innerHTML += `<li><a class='langLink' href="" onclick="return setLanguage('${name}')" title="${alias}">${alias}</a></li>`;
    }  
  });
  
  if (!dataPath || !pagePath) {
    SetHeaderText(_T(LK_HEADING_SELECT_LEFT));
  }
  
  if (!dataPath) {
    console.log(`Data file has not been specified. Use ?${PAR_NAME_DOC}= and its path in URI. Used default file name.`);
    dataPath = FILENAME_DEFAULT_HELPFILE;
    msgNoData = _T(LK_MSG_NODATA);
    contentPane.innerHTML = msgNoData;
  }
  
  if (dataPath) {
    (async () => {
      // load tree data
      archive = await loadZipFromUrl(dataPath);
      const srcTreeData = await searchArchiveForFile(FILENAME_TREE, archive);
      tree.innerHTML = linesToHtmlTree(srcTreeData);
      fixImgRelativePathToZipPaths(tree);
      revealTreeItem(N_P_TREEITEM + idxTreeItem);
      updateNavButtons(idxTreeItem);
    
      getPathData(pagePath, pagePath);
      
      const bookOpen = await getDataOfPathInZIPImage(FILENAME_BOOKO, archive);
      const bookClosed = await getDataOfPathInZIPImage(FILENAME_BOOKC, archive);
      
      if (bookOpen && bookClosed) {
        appendCSS('overridePlusMinus',
`ul.tree details > summary::before {
  content: url("${bookClosed}");
}

ul.tree details[open] > summary::before {
  transform: rotate(0deg);
  content: url("${bookOpen}");
}` 
        );
         
      }
    })();
  }
});

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
  return `?${PAR_NAME_DOC}=${dataPath}&${PAR_NAME_PAGE}=${encodeURIComponent(val)}&${PAR_NAME_ID}=${encodeURIComponent(idxTreeItem)}`;
}

function setSearchParams(url, path, i) {
  url.searchParams.set(PAR_NAME_PAGE, path);
  pagePath = path;
  url.searchParams.set(PAR_NAME_ID, i);
}
/*E: Topic renderer logic integration */