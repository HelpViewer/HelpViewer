const treeTOCName = 'tree';
const contentPane = $('content');

EventBus.sub(EventNames.TreeDataChanged, (d) => {
  if (d.treeId != treeTOCName)
    return;

  showChapterByData(idxTreeItem, pagePath);
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
  alert('getPathData:1');
  //-getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
  //showChapter(null, getChapterAlternativeHeading(pagePath)[1], pagePath, null);
  
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
  
  alert('getPathData:2');
  //-getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
  //---showChapter(null, undefined, pagePath, null);
  //loadPageByTreeId(d.newId, d.treeId);
  showChapterByData(idxTreeItem, pagePath);
});

function showChapterByData(idxTreeItem, pagePath, popstate = undefined) {
  contentPane.innerHTML = _T('MSG_PATH_NOT_FOUND_IN_ARCH');
  log('E !!! ' + pagePath);
  //if (pagePath.startsWith('@') || popstate)
    return showChapter(null, undefined, pagePath, null);

  const tree = $(treeTOCName);
  var elid = `${treeTOCName}|${idxTreeItem}`;

  observeDOMAndDo(() => {
    var el = $(elid);

    if (el) {
      treeActions(el, elid);
      return true;
    } else {
      if (tree) {
        el = $O(`[data-param="${pagePath}"]`);
        elid = el?.id;
        treeActions(el, elid);
        return true;
      }
    }

    function treeActions(el, elid) {
      if (!el || !elid)
        return;
      
      showChapterA(null, el);
      fixImgRelativePathToZipPaths(tree, STO_HELP);
      revealTreeItem(elid);
    }
  }, undefined, 10000);
}

EventBus.sub(EventNames.ClickedEventTree, async (d) => {
  if (d.treeId != 'tree' && d.treeId != 'subsList') 
    return;

  const sidebar = $('sidebar');
  if (sidebar.classList.contains(C_TOOWIDE) && !sidebar.classList.contains(C_HIDDENC))
    toggleSidebar();
});

EventBus.sub(EventNames.UserDataFileLoaded, async (d) => {
  showSidebarTab();
});

EventBus.sub(EventNames.ClickedEventNotForwarded, async (d) => {
  log('W undeliverable: ' + d.elementId);
  
  if (!d.target)
    d.stop = true;

  const a = d.target.closest('a');
  if (!d.target.closest('a, input, summary, button'))
    d.stop = true;

  log('E stop: ' + d.stop);

  if (d.stop) {
    d.event.preventDefault();
    return;
  }

  if (a)
    showChapterA(d.event, a);
});

var PRJNAME_VAL = null;

EventBus.sub(EventNames.ConfigFileReloadFinished, async (d) => {
  if (d.id != 'FILE_CONFIG')
    return;
  PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME)?.trim().split('/');
});

const PAR_NAME_PAGE = 'p'; // chapter page path

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

const tree = $('tree');

window.addEventListener('popstate', () => {
  LoadURLParameters();

  if (typeof dataPath !== 'string' || dataPath.trim() === '')
    dataPath = FILENAME_DEFAULT_HELPFILE;

  //-getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
  //showChapter(null, getChapterAlternativeHeading(pagePath)[1], pagePath, null);
  showChapterByData(idxTreeItem, pagePath, true);
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
        setPanelsEmpty();
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
      
      var button = $(BTN_CHANGEVERSION);
      
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

  $A('.content *').forEach(el => {
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
  setPanelsEmpty();

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

EventBus.sub(EventNames.ChapterShown, (d) => {
  if (d.sourceObject) {
    setToHref(d.sourceObject.href);
  } else {
    setToHrefByValues((x) => {
      x.kvlist.set(PAR_NAME_PAGE, d.address);
      x.kvlist.set(PAR_NAME_ID, idxTreeItem);
    });
  }  
});

showChapterByData(idxTreeItem, pagePath);
