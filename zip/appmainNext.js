const PAR_NAME_PAGE = 'p'; // chapter page path

const LK_HEADING_SELECT_LEFT = 'HEADING_SELECT_LEFT';
const LK_MSG_NODATA = 'MSG_NODATA';

const KEY_LS_KWLISTINGCOUNT = "keywordListingCount";
const listingCount = parseInt(localStorage.getItem(KEY_LS_KWLISTINGCOUNT)) || 50;

function LoadURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  dataPath = urlParams.get(PAR_NAME_DOC)?.replace('__', activeLanguage);
  pagePath = urlParams.get(PAR_NAME_PAGE) || FILENAME_1STTOPIC;
  idxTreeItem = parseInt(urlParams.get(PAR_NAME_ID)) || 0;
}

LoadURLParameters();
const treeItemHandlerGet = () => idxTreeItem;
var navPanel = newNavigation('nav', treeItemHandlerGet, N_P_TREEITEM);
window.nav = navPanel;
navPanel.updateNavButtons(idxTreeItem);

const handlers = {
  'downP-SwitchColorMode': (event) => { ColorTheme.switchColorMode() },
  'downP-Home': (event) => { loadPage(event, 'README.md', 'README.md', 0) },
  'downP-ToggleFS': (event) => { switchFullScreen() },
  'downP-Hide': (event) => { toggleSidebar() },
  'downP-ToggleSide': (event) => { toggleSidebarSide() },

  'showBtn': (event) => { toggleSidebar() },
  'printBtn': (event) => { window.print() },

  'nav-left': (event) => { nav.navPrev(event) },
  'nav-top': (event) => { nav.navTop(event); },
  'nav-right': (event) => { nav.navNext(event); },
};

const handlerSwitchTab = (id) => showSidebarTab(id);

function handlePnlBtn(event) {
  const id = event.currentTarget.id;
  if (handlers[id])
    handlers[id](event);
  else
    handlerSwitchTab(`sp-${id}`);
}

document.querySelectorAll('.pnl-btn').forEach(btn => {
  btn.addEventListener('click', handlePnlBtn);
});

const tree = document.getElementById('tree');

window.addEventListener('popstate', () => {
  LoadURLParameters();

  if (typeof dataPath !== 'string' || dataPath.trim() === '') {
    dataPath = FILENAME_DEFAULT_HELPFILE;
  }

  getPathData(pagePath, pathHeadingAlias?.get(pagePath));
  navPanel.updateNavButtons(idxTreeItem);
});

contentPane.addEventListener('click', function(event) {
  const link = event.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');

  if (
    href.startsWith('http') || 
    href.startsWith('//') || 
    (href.startsWith(`?${PAR_NAME_DOC}=`) && !href.startsWith(`?${PAR_NAME_DOC}=${dataPath}`) )
  ) return;

  event.preventDefault();
  history.pushState({}, '', href);
  
  LoadURLParameters();
  getPathData(pagePath, pathHeadingAlias?.get(pagePath));
});

var languages = getLanguagesList();

const langTab = document.getElementById('langList');
const LANGLINKS_PREFIX = 'lng-';

function handleSetLanguage(event) {
  const target = event.target.closest('a.langLink');
  if (!target) return;

  const id = target.id.substring(LANGLINKS_PREFIX.length);
  setLanguage(id);
}

langTab?.addEventListener('click', handleSetLanguage);

loadLocalization(activeLanguage).then(() => {
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
        await _Storage.add(STO_HELP, dataPath);
      } catch {
        msgNoData = _T(LK_MSG_NODATA);
        contentPane.innerHTML = msgNoData;
        SetHeaderText(_T(LK_HEADING_SELECT_LEFT));
        return;
      }
      
      // load config file
      FILE_CONFIG = (await _Storage.search(STO_HELP, FILENAME_CONFIG));
      
      if (!FILE_CONFIG) {
        FILE_CONFIG = null;
      } else {
        FILE_CONFIG = parseConfigFile(FILE_CONFIG);
        
        var val = configGetValue(CFG_KEY_OverrideSidebarVisible, sidebarVisible);
        
        if (sidebar) {
          if (val != sidebarVisible) 
            toggleSidebar();
        }

        val = configGetValue(CFG_KEY_OverrideColorTheme, ColorTheme.getCurrentColorMode());
        
        if (val) 
          ColorTheme.setColorMode(val);
      }
      
      // load languages
      languages.then(async (languages) => {
        var langsFromHelp = (configGetValue(CFG_KEY_Languages, '') || '')?.split(';') || [];
        const langs = new Set(await _Storage.getSubdirs(STO_DATA, languagesMainPath));
        langsFromHelp = langsFromHelp.filter(lang => !langs.has(lang));
        langsFromHelp.forEach((data, idx) => {
          languages.push(`${data}|${data}`);
        });
    
        langTab.innerHTML = '';
      
        for (var i = 0; i < languages.length; i++) {
          const parts = languages[i].split("|");
          const alias = parts[0]?.trim() || "";
          const name = parts[1]?.trim() || "";
          langTab.innerHTML += `<li><a class='langLink' href="" id="${LANGLINKS_PREFIX}${name}" title="${alias}">${alias}</a></li>`;
        }
      });

      // load tree data
      const srcTreeData = await _Storage.search(STO_HELP, FILENAME_TREE);
      tree.innerHTML = linesToHtmlTree(srcTreeData, N_P_TREEITEM);
      fixImgRelativePathToZipPaths(tree, STO_HELP);
      revealTreeItem(`${N_P_TREEITEM}|${idxTreeItem}`);
      navPanel.updateNavButtons(idxTreeItem);
      
      if (!srcTreeData) {
        hideButton('downP-TopicTree');
        showSidebarTab('sp-downP-ChapterAnchor');
      }
      
      const docList = (await _Storage.search(STO_HELP, FILENAME_FILES));
      getDocumentHeadingTable(docList);
    
      // Load keywords
      const KEYWORDS = (await _Storage.search(STO_HELP, FILENAME_KEYWORDS));

      if (KEYWORDS) {
        const KWTOFILES = (await _Storage.search(STO_HELP, FILENAME_KWTOFILES));
        const klist = newKeywordDatabase(KLIST_NAME, KEYWORDS, KWTOFILES);
        keywordLists.set(KLIST_NAME, klist);
        await klist.readKeywordDatabase();
        var foundKeywords = klist.getTreeData(null, listingCount);
        const pane = document.getElementById(PANE_KEYWORDS_ID);
        
        if (pane)
          pane.innerHTML = linesToHtmlTree(foundKeywords, N_P_TREEITEM_KWDS);
      } else {
        hideButton('downP-Glossary');
      }
      
      // fulltext keywords
      const FTSKEYWORDS = (await _Storage.search(STO_HELP, FILENAME_FTS_KEYWORDS));
      
      if (FTSKEYWORDS) {
        const KWTOFILES = (await _Storage.search(STO_HELP, FILENAME_FTS_KWTOFILES));
        const klist = newKeywordDatabase(KLIST_FTS_NAME, FTSKEYWORDS, KWTOFILES);
        keywordLists.set(KLIST_FTS_NAME, klist);
        await klist.readKeywordDatabase();
        var foundKeywords = klist.getTreeData(null, listingCount);
        const pane = document.getElementById(PANE_FTS_KEYWORDS_ID);
        
        if (pane)
          pane.innerHTML = linesToHtmlTree(foundKeywords, N_P_TREEITEM_FTS);
      } else {
        hideButton('downP-Fulltext');
      }
      
      // Load favicon
      const customFavicon = await getDataOfPathInZIPImage(FILENAME_FAVICON, STO_HELP);
      
      if (customFavicon)
        changeFavicon(customFavicon);
      
      // load chapter document
      getPathData(pagePath, pathHeadingAlias?.get(pagePath));
      
      // override book images in tree structure
      var bookOpen = await getDataOfPathInZIPImage(FILENAME_BOOKO, STO_HELP);
      var bookClosed = await getDataOfPathInZIPImage(FILENAME_BOOKC, STO_HELP);
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
  if (!sidebar) return;
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
  i = parseInt(i);
  if (i) {
    url.searchParams.set(PAR_NAME_ID, i);
  }
}
/*E: Topic renderer logic integration */

const FTSINPUT = 'fulltextList-i';

function handleEnterOnField(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    var id = event.target.id.replace('-i', '');
    
    var phrase = event.target.value;

    if (event.target.id === FTSINPUT) {
      phrase = phrase.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    
    var foundKeywords = keywordLists.get(id).getTreeData(phrase, listingCount);
    const pane = document.getElementById(id);
    
    if (pane)
      pane.innerHTML = linesToHtmlTree(foundKeywords, "tr-" + event.target.id);
  }
  
  if (event.key.substring(0, 3) === 'Esc') {
    event.target.value = "";
    event.target.blur(); 
  }
}

var input_kw = document.getElementById('keywordList-i');
input_kw.addEventListener('keydown', handleEnterOnField);

var input_kw = document.getElementById(FTSINPUT);
input_kw.addEventListener('keydown', handleEnterOnField);

function handleClickOnTrees(event) {
  const target = event.target;
  if (!target) return;

  const a = target.closest('a');
  if (!a) return;

  var targName = target.id.split('|');
  var idI = targName[1];
  targName = targName[0];
  if (targName === N_P_TREEITEM) {
    idI = parseInt(idI);
    if (idI) {
      idxTreeItem = idI;
    }
  }

  var data = target.getAttribute('data-param');
  if (!data) return;

  data = data.split(';');
  path = data[0];

  if (path.startsWith('@')) {
    path = path.substring(1).split(":");
    event.preventDefault();
    searchKeywordE(target, path[0], path[1]);
    const p = document.createElement('span');
    a.parentNode.replaceChild(p, a);
    p.innerHTML = a.innerHTML;
  } else
  if (path.startsWith('#')) {
    event.preventDefault();
    scrollToAnchor(path.substring(1));
  } else
  {
    loadPage(event, path, target.innerHTML, idI);
  }
}

document.querySelectorAll('ul.tree:not(#langList)').forEach(tree => {
  tree.addEventListener('click', handleClickOnTrees);
});