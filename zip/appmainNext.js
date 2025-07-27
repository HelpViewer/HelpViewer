const PAR_NAME_PAGE = 'p'; // chapter page path

const LK_HEADING_SELECT_LEFT = 'HEADING_SELECT_LEFT';
const LK_MSG_NODATA = 'MSG_NODATA';

const KEY_LS_KWLISTINGCOUNT = "keywordListingCount";
const listingCount = parseInt(getUserConfigValue(KEY_LS_KWLISTINGCOUNT)) || 50;

const KEY_LS_PRINTICONS = "printIcons";
const printIcons = parseInt(getUserConfigValue(KEY_LS_PRINTICONS)) ?? 2;

var dataPathGeneral;

var activeLanguage = getActiveLanguage();

function LoadURLParameters() {
  var handler = (x) => x;
  dataPathGeneral = getGets(PAR_NAME_DOC, handler);
  dataPath = dataPathGeneral?.replace('__', activeLanguage);
  pagePath = getGets(PAR_NAME_PAGE, handler) || FILENAME_1STTOPIC;
  idxTreeItem = parseInt(getGets(PAR_NAME_ID, handler)) || 0;
}

LoadURLParameters();
const treeItemHandlerGet = () => idxTreeItem;
var navPanel = newNavigation('nav', treeItemHandlerGet, N_P_TREEITEM);
window.nav = navPanel;
navPanel.updateNavButtons(idxTreeItem);

const BTN_CHANGEVERSION = 'downP-ChangeVersion';
const BTN_CHANGELANG = 'downP-ChangeLanguage';

const handlers = {
  'downP-SwitchColorMode': (event) => { setColorMode() },
  'downP-Home': (event) => { loadPage(event, 'README.md', 'README.md', 0) },
  'downP-ToggleFS': (event) => { switchFullScreen() },
  'downP-Hide': (event) => { toggleSidebar() },
  'downP-ToggleSide': (event) => { toggleSidebarSide() },

  'showBtn': (event) => { toggleSidebar() },
  'printBtn': (event) => { window.print() },

  'nav-left': (event) => { nav.navPrev(event) },
  'nav-top': (event) => { nav.navTop(event); },
  'nav-right': (event) => { nav.navNext(event); },
  [BTN_CHANGEVERSION]: (event) => {
    const pathVersions = '~' + getHelpRepoUri(PRJNAME_VAL[0], PRJNAME_VAL[1]) + FILENAME_CHANGELOG;
    getPathData(pathVersions, pathVersions);
    showSidebarTab(`sp-downP-ChapterAnchor`);
   },
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
  setToHref(href);
  
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
  loadLocalization(id);
}

langTab?.addEventListener('click', handleSetLanguage);

var PRJNAME_VAL = null;

loadLocalization(activeLanguage).then(() => {
  if (!dataPath || !pagePath) {
    SetHeaderText(_T(LK_HEADING_SELECT_LEFT));
  }
  
  if (!dataPath) {
    log(`Data file has not been specified. Use ?${PAR_NAME_DOC}= and its path in URI. Used default file name.`);
    dataPath = FILENAME_DEFAULT_HELPFILE;
    msgNoData = _T(LK_MSG_NODATA);
    contentPane.innerHTML = msgNoData;
  }
  
  if (dataPath) {
    (async () => {
      // load zip file
      try {
        if (dataPath !== FILENAME_ZIP_ON_USER_INPUT)
          await _Storage.add(STO_HELP, dataPath);
      } catch {
        msgNoData = _T(LK_MSG_NODATA);
        contentPane.innerHTML = msgNoData;
        SetHeaderText(_T(LK_HEADING_SELECT_LEFT));
        return;
      }
      
      // load config file
      var FILE_CONFIG_TEST = (await storageSearch(STO_HELP, FILENAME_CONFIG));
      
      if (!FILE_CONFIG_TEST) {
        // language from local storage probably does not exists, reload with english
        if (activeLanguage !== DEFAULT_LANG) {
          loadLocalization(DEFAULT_LANG);
          location.reload(true);  
        }
      } else {
        await configFileReload(FILE_CONFIG);
        PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME).trim().split('/');
        
        toggleSidebar(configGetValue(CFG_KEY_OverrideSidebarVisible, sidebarVisible));

        setColorMode(getCurrentColorMode());
      }
      
      // load languages
      languages.then(async (languages) => {
        var langsFromHelp = (configGetValue(CFG_KEY_Languages, '') || '')?.split(';') || [];
        langsFromHelp = langsFromHelp.filter(lang => !languages.includes(lang));
        languages = await getLanguagesList(langsFromHelp);
        langTab.innerHTML = '';
      
        for (var i = 0; i < languages.length; i++) {
          const parts = languages[i].split("|");
          const alias = parts[0]?.trim() || "";
          const name = parts[1]?.trim() || "";
          langTab.innerHTML += `<li><a class='langLink' href="" id="${LANGLINKS_PREFIX}${name}" title="${alias}">${alias}</a></li>`;
        }
      });

      // load tree data
      const srcTreeData = await storageSearch(STO_HELP, FILENAME_TREE);
      tree.innerHTML = linesToHtmlTree(srcTreeData, N_P_TREEITEM);
      fixImgRelativePathToZipPaths(tree, STO_HELP);
      revealTreeItem(`${N_P_TREEITEM}|${idxTreeItem}`);
      navPanel.updateNavButtons(idxTreeItem);
      
      if (!srcTreeData) {
        hideButton('downP-TopicTree');
        showSidebarTab(`sp-${PANEL_NAME_CHAPTERANCHOR}`);
      }
      
      const docList = (await storageSearch(STO_HELP, FILENAME_FILES));
      getDocumentHeadingTable(docList);
    
      // Load keywords
      const KEYWORDS = (await storageSearch(STO_HELP, FILENAME_KEYWORDS));

      if (KEYWORDS) {
        const KWTOFILES = (await storageSearch(STO_HELP, FILENAME_KWTOFILES));
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
      const FTSKEYWORDS = (await storageSearch(STO_HELP, FILENAME_FTS_KEYWORDS));
      
      if (FTSKEYWORDS) {
        const KWTOFILES = (await storageSearch(STO_HELP, FILENAME_FTS_KWTOFILES));
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
      var [bookOpen, bookClosed] = await Promise.all([
        getDataOfPathInZIPImage(FILENAME_BOOKO, STO_HELP),
        getDataOfPathInZIPImage(FILENAME_BOOKC, STO_HELP),
      ]);

      var doOverride = null;
      
      if (bookOpen && bookClosed) {
        bookOpen = `url("${bookOpen}")`;
        bookClosed = `url("${bookClosed}")`;
        doOverride = 1;
      } else {
        bookOpen = configGetValue(CFG_KEY_OverrideBookIconOpened);
        bookClosed = configGetValue(CFG_KEY_OverrideBookIconClosed);
        
        if (bookOpen && bookClosed) {
          const icon = document.createElement('span');
          icon.innerHTML = bookOpen;
          bookOpen = icon.innerHTML;
          icon.innerHTML = bookClosed;
          bookClosed = icon.innerHTML;
          bookOpen = `"${bookOpen}"`;
          bookClosed = `"${bookClosed}"`;
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

      // other versions list
      const pathVersions = getHelpRepoUri(PRJNAME_VAL[0], PRJNAME_VAL[1]) + FILENAME_CHANGELOG;
      var txt = null;
      try {
        const verList = await fetchData(pathVersions);
        txt = toText(verList);
      } catch (error) {
        txt = null;
      }
      
      var button = document.getElementById(BTN_CHANGEVERSION);
      
      if (txt && button) {
        button.classList.remove(C_HIDDENC);
        //----recomputeButtonPanel(button);
      }

      if (dataPath === FILENAME_ZIP_ON_USER_INPUT) {
        hideButton(BTN_CHANGEVERSION);
        hideButton(BTN_CHANGELANG);
      }

    })();
  }
});



/*S: Topic renderer logic integration */
function convertRelativePathToViewerURI(val) {
  var pard = dataPathGeneral ? `${PAR_NAME_DOC}=${dataPathGeneral}&` : ``;
  return `?${pard}${PAR_NAME_PAGE}=${encodeURIComponent(val)}&${PAR_NAME_ID}=${encodeURIComponent(idxTreeItem)}`;
}

function setSearchParams(url, path, i) {
  setToHrefByValues((x) => {
    x.kvlist.set(PAR_NAME_PAGE, path);
    i = parseInt(i);
    if (i)
      x.kvlist.set(PAR_NAME_ID, i);
  });
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
  var path = data[0];

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

  if (
    document.getElementById(`sp-${PANEL_NAME_CHAPTERANCHOR}`).classList.contains(C_HIDDENC) &&
    document.getElementById(`sp-downP-TopicTree`).classList.contains(C_HIDDENC) &&
    !a.id.startsWith('kwdf-|')
  ) return;

  if (sidebar.classList.contains(C_TOOWIDE) && !sidebar.classList.contains(C_HIDDENC))
    toggleSidebar();
}

document.querySelectorAll('ul.tree:not(#langList)').forEach(tree => {
  tree.addEventListener('click', handleClickOnTrees);
});

const DIRECTIVE_PRINT_KEEP_ICONS = '<!-- @print-keep-icons -->';

function removeIconsForPrint() {
  openSubtree(contentPane);

  var keepIconsConfig = (configGetValue(CFG_KEY_OverridePrintKeepIcons) || 0) == 1 ? 1 : 0;
  const directivePresent = contentPane.innerHTML.includes(DIRECTIVE_PRINT_KEEP_ICONS) ? 1 : 0;
  var decision = (keepIconsConfig + directivePresent) % 2;

  if (printIcons == 0 || printIcons == 1)
    decision = printIcons;

  if (decision == 1)
    return;

  document.querySelectorAll('.content *').forEach(el => {
    clearIconsFromText(el);
  });
  
  setHeader(clearIconsFromTextSingleText(getHeader()));

  document.title = clearIconsFromTextSingleText(document.title);
}

window.addEventListener('beforeprint', removeIconsForPrint);

EventBus.sub("GetsChanges", (data) => {
  alert("unsets: " + data.unset);
  alert("changes: " + Array.from(data.changes.keys()));
});