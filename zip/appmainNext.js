EventBus.sub(EventNames.TreeDataChanged, (d) => {
  const treeTOCName = 'tree';
  if (d.treeId != treeTOCName)
    return;
  const tree = document.getElementById(treeTOCName);
  fixImgRelativePathToZipPaths(tree, STO_HELP);
  revealTreeItem(`${treeTOCName}|${idxTreeItem}`);
});

//EventBus.sub(EVT_PluginsLoadingFinished, (d) => showSidebarTab());

EventBus.sub(EventNames.StorageAdded, async (d) => {
  if (d.storageName != STO_HELP)
    return;

  notifyUserDataFileLoaded(d.fileName);

  // Load favicon
  const customFavicon = await getDataOfPathInZIPImage(FILENAME_FAVICON, STO_HELP);
  
  if (customFavicon)
    changeFavicon(customFavicon);
  
  // load chapter document
  getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
  
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
  
  getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
  //loadPageByTreeId(d.newId, d.treeId);
});

EventBus.sub(EventNames.UserDataFileLoaded, async (d) => {
  showSidebarTab();
});

var PRJNAME_VAL = null;

EventBus.sub(EventNames.ConfigFileReloadFinished, async (d) => {
  if (d.id != 'FILE_CONFIG')
    return;
  PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME)?.trim().split('/');
});

const PAR_NAME_PAGE = 'p'; // chapter page path

const LK_HEADING_SELECT_LEFT = 'HEADING_SELECT_LEFT';
const LK_MSG_NODATA = 'MSG_NODATA';

const KEY_LS_PRINTICONS = "printIcons";
const printIcons = parseInt(getUserConfigValue(KEY_LS_PRINTICONS)) ?? 2;

var dataPathGeneral;

var activeLanguage = getActiveLanguage();

function LoadURLParameters() {
  var handler = (x) => x;
  dataPathGeneral = getGets(PAR_NAME_DOC, handler) || FILENAME_DEFAULT_HELPFILE;
  dataPath = dataPathGeneral?.replace('__', activeLanguage);
  pagePath = getGets(PAR_NAME_PAGE, handler) || FILENAME_1STTOPIC;
  idxTreeItem = parseInt(getGets(PAR_NAME_ID, handler)) || 0;
}

LoadURLParameters();
const treeItemHandlerGet = () => idxTreeItem;

const BTN_CHANGEVERSION = 'downP-ChangeVersion';
const BTN_CHANGELANG = 'downP-ChangeLanguage';

const tree = document.getElementById('tree');

window.addEventListener('popstate', () => {
  LoadURLParameters();

  if (typeof dataPath !== 'string' || dataPath.trim() === '') {
    dataPath = FILENAME_DEFAULT_HELPFILE;
  }

  getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
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
  getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
});

var languages = getLanguagesList();

loadLocalization(activeLanguage).then(() => {
  if (!dataPath)
    log(`Data file has not been specified. Use ?${PAR_NAME_DOC}= and its path in URI. Used default file name.`);  
  else {
    (async () => {
      // load zip file
      try {
        if (dataPath !== FILENAME_ZIP_ON_USER_INPUT)
          //await _Storage.add(STO_HELP, dataPath);
          await storageAdd(dataPath, STO_HELP);
        else
          storageAddedNotification(dataPath, STO_HELP);
        configFileReload(FILE_CONFIG);
      } catch {
        msgNoData = _T(LK_MSG_NODATA);
        contentPane.innerHTML = msgNoData;
        SetHeaderText(_T(LK_HEADING_SELECT_LEFT));
        return;
      }
      
      
      revealTreeItem(`${N_P_TREEITEM}|${idxTreeItem}`);
      
      // if (!srcTreeData) {
      //   hideButton('downP-TopicTree');
      //   showSidebarTab(`sp-${PANEL_NAME_CHAPTERANCHOR}`);
      // }

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
        //hideButton(BTN_CHANGELANG);
      }

    })();
  }
});

/*S: Topic renderer logic integration */
function convertRelativePathToViewerURI(val, id = undefined) {
  var pard = dataPathGeneral ? `${PAR_NAME_DOC}=${dataPathGeneral}&` : ``;
  return `?${pard}${PAR_NAME_PAGE}=${encodeURIComponent(val)}&${PAR_NAME_ID}=${encodeURIComponent(id || idxTreeItem)}`;
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
    //searchKeywordE(target, path[0], path[1]);
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

// document.querySelectorAll('ul.tree:not(#langList)').forEach(tree => {
//   tree.addEventListener('click', handleClickOnTrees);
// });

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

function clearIconsFromText(el) {
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = clearIconsFromTextSingleText(node.textContent);
    }
  });
}

function clearIconsFromTextSingleText(txt) {
  return txt?.replace(/[^\x00-\x7F\u00A0-\u024F.,;:!?()\[\]{}<>"'@#%&*\-\s]/g, '');
}

EventBus.sub('BeforePrint', removeIconsForPrint);

EventBus.sub(EventNames.LOC_LOADED, (d) => {
  msgNoData = _T(LK_MSG_NODATA);
  contentPane.innerHTML = msgNoData;
  SetHeaderText(_T(LK_HEADING_SELECT_LEFT));

  activeLanguage = getActiveLanguage();
  LoadURLParameters();
  try {
    storageAdd(dataPath, STO_HELP);
  } catch (error) {
    return;
  }
});

EventBus.sub(EventNames.NavigationMove, (d) => {
  loadPageByTreeId(d.newId, d.treeId);
});
