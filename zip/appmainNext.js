const PAR_NAME_PAGE = 'p'; // chapter page path

const LK_HEADING_SELECT_LEFT = 'HEADING_SELECT_LEFT';
const LK_MSG_NODATA = 'MSG_NODATA';

function LoadURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  dataPath = urlParams.get(PAR_NAME_DOC)?.replace('__', activeLanguage);
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

  getPathData(pagePath, pathHeadingAlias.get(pagePath));
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
  getPathData(pagePath, pathHeadingAlias.get(pagePath));
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
      // load zip file
      try {
        archive = await loadZipFromUrl(dataPath);
      } catch {
        msgNoData = _T(LK_MSG_NODATA);
        contentPane.innerHTML = msgNoData;
        SetHeaderText(_T(LK_HEADING_SELECT_LEFT));
        return;
      }
      
      // load config file
      FILE_CONFIG = (await searchArchiveForFile(FILENAME_CONFIG, archive));
      
      if (!FILE_CONFIG) {
        FILE_CONFIG = null;
      } else {
        FILE_CONFIG = parseConfigFile(FILE_CONFIG);
        
        var val = configGetValue(CFG_KEY_OverrideSidebarVisible, sidebarVisible);
        
        if (sidebar) {
          if (val != sidebarVisible) 
            toggleSidebar();
        }

        val = configGetValue(CFG_KEY_OverrideColorTheme, colorTheme);
        
        if (val) 
          setColorMode(val);
      }
      
      // load tree data
      const srcTreeData = await searchArchiveForFile(FILENAME_TREE, archive);
      tree.innerHTML = linesToHtmlTree(srcTreeData);
      fixImgRelativePathToZipPaths(tree);
      revealTreeItem(N_P_TREEITEM + idxTreeItem);
      updateNavButtons(idxTreeItem);
      
      if (!srcTreeData) {
        hideButton('downP-TopicTree');
        showSidebarTab('sp-subsections');
      }
    
      // Load keywords
      const KEYWORDS = (await searchArchiveForFile(FILENAME_KEYWORDS, archive));

      if (KEYWORDS) {
        const KWTOFILES = (await searchArchiveForFile(FILENAME_KWTOFILES, archive));
        const klist = newKeywordDatabase(KLIST_NAME, KEYWORDS, KWTOFILES);
        keywordLists.set(KLIST_NAME, klist);
        var foundKeywords = await klist.readKeywordDatabase();
        const pane = document.getElementById(PANE_KEYWORDS_ID);
        
        if (pane)
          pane.innerHTML = linesToHtmlTree(foundKeywords);
      } else {
        hideButton('downP-Glossary');
      }
      
      const FTSKEYWORDS = (await searchArchiveForFile(FILENAME_FTS_KEYWORDS, archive));
      
      if (FTSKEYWORDS) {
      } else {
        hideButton('downP-Fulltext');
      }
      
      // Load favicon
      const customFavicon = await getDataOfPathInZIPImage(FILENAME_FAVICON, archive);
      
      if (customFavicon)
        changeFavicon(customFavicon);
      
      getPathData(pagePath, pathHeadingAlias.get(pagePath));
      
      var bookOpen = await getDataOfPathInZIPImage(FILENAME_BOOKO, archive);
      var bookClosed = await getDataOfPathInZIPImage(FILENAME_BOOKC, archive);
      var doOverride = null;
      
      if (bookOpen && bookClosed) {
        var bookOpen = `url("${bookOpen}")`;
        var bookClosed = `url("${bookClosed}")`;
        doOverride = 1;
      } else {
        var bookOpen = configGetValue(CFG_KEY_OverrideBookIconOpened);
        var bookClosed = configGetValue(CFG_KEY_OverrideBookIconClosed);
        
        if (bookOpen && bookClosed) {
          const icon = document.createElement('span');
          icon.innerHTML = bookOpen;
          bookOpen = icon.innerHTML;
          icon.innerHTML = bookClosed;
          bookClosed = icon.innerHTML;
          var bookOpen = `"${bookOpen}"`;
          var bookClosed = `"${bookClosed}"`;
          doOverride = 1;
        }
      }
      
      if (doOverride) {
        appendCSS('overridePlusMinus',
`ul.tree details > summary::before {
  content: ${bookClosed};
}

ul.tree details[open] > summary::before {
  transform: rotate(0deg);
  content: ${bookOpen};
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
  if (i) {
    url.searchParams.set(PAR_NAME_ID, i);
  }
}
/*E: Topic renderer logic integration */