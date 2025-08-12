const treeTOCName = 'tree';
const contentPane = $('content');

var pagePath = '';
var dataPath = '';

FILENAME_DEFAULT_HELPFILE = `hlp/Help-__.zip`;

EventBus.sub(EventNames.TreeDataChanged, (d) => {
  if (d.treeId != treeTOCName)
    return;

  showChapterByData(idxTreeItem, pagePath);
});

EventBus.sub(EventNames.StorageAdded, async (d) => {
  if (d.storageName != STO_HELP)
    return;

  notifyUserDataFileLoaded(d.fileName);
});

function showChapterByData(idxTreeItem, pagePath) {
  contentPane.innerHTML = _T('MSG_PATH_NOT_FOUND_IN_ARCH');
  //log('E !!! ' + pagePath);
  //if (pagePath.startsWith('@') || popstate)
    showChapter(null, undefined, pagePath, null);

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
      
      //showChapterA(null, el);
      fixImgRelativePathToZipPaths(tree, STO_HELP);
      revealTreeItem(elid);
    }
  }, undefined, 10000);
}

EventBus.sub(EventNames.ClickedEventTree, async (d) => {
  if (d.treeId != 'tree' && d.treeId != 'subsList') 
    return;

  idxTreeItem = d.elementIdVal;

  const sidebar = $('sidebar');
  if (sidebar.classList.contains(C_TOOWIDE) && !sidebar.classList.contains(C_HIDDENC))
    toggleSidebar();
});

EventBus.sub(EventNames.UserDataFileLoaded, async (d) => {
  configFileReload(FILE_CONFIG);
  showChapterByData(idxTreeItem, pagePath);
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
    processAClick(a, d);
});

var PRJNAME_VAL = null;

EventBus.sub(EventNames.ConfigFileReloadFinished, async (d) => {
  if (d.id != 'FILE_CONFIG')
    return;
  PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME)?.trim().split('/');


  // Load favicon
  const customFavicon = await getDataOfPathInZIPImage(FILENAME_FAVICON, STO_HELP);
  
  if (customFavicon)
    changeFavicon(customFavicon);
    
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
});

const PAR_NAME_PAGE = 'p'; // chapter page path

const KEY_LS_PRINTICONS = "printIcons";
const printIcons = parseInt(getUserConfigValue(KEY_LS_PRINTICONS)) ?? 2;

var dataPathGeneral;

var activeLanguage = getActiveLanguage();

const PLG_KEY_HASH = '_hash';

function LoadURLParameters() {
  var handler = (x) => x;
  dataPathGeneral = getGets(PAR_NAME_DOC, handler) || FILENAME_DEFAULT_HELPFILE;
  dataPath = dataPathGeneral?.replace('__', activeLanguage);
  pagePath = getGets(PAR_NAME_PAGE, handler) || FILENAME_1STTOPIC;
  idxTreeItem = parseInt(getGets(PAR_NAME_ID, handler)) || 0;
}

const evtHashDefined = 'HASHDEFINED';
addEventDefinition(evtHashDefined, new EventDefinition(IEvent, evtHashDefined));

EventBus.sub(evtHashDefined, async (d) => {
  scrollToAnchor(d.result);
});

LoadURLParameters();
const treeItemHandlerGet = () => idxTreeItem;

const BTN_CHANGEVERSION = 'downP-ChangeVersion';
const BTN_CHANGELANG = 'downP-ChangeLanguage';

const tree = $('tree');

window.addEventListener('popstate', () => {
  //LoadURLParameters();

  if (typeof dataPath !== 'string' || dataPath.trim() === '')
    dataPath = FILENAME_DEFAULT_HELPFILE;

  //-getPathData(pagePath, getChapterAlternativeHeading(pagePath)[1]);
  //showChapter(null, getChapterAlternativeHeading(pagePath)[1], pagePath, null);
  showChapterByData(idxTreeItem, pagePath);
  //, true
});

var languages = getLanguagesList();

loadLocalization(activeLanguage).then(() => {
  if (!dataPath)
    log(`Data file has not been specified. Use ?${PAR_NAME_DOC}= and its path in URI. Used default file name.`);  
  else {
    (async () => {
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
  var pard = dataPathGeneral ? `&${PAR_NAME_DOC}=${dataPathGeneral}` : ``;
  //${pard}
  return `?${PAR_NAME_PAGE}=${encodeURIComponent(val)}&${PAR_NAME_ID}=${encodeURIComponent(id || idxTreeItem)}${pard}`;
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

EventBus.sub('BeforePrint', removeIconsForPrint);

EventBus.sub(EventNames.LOC_LOADED, (d) => {
  setPanelsEmpty();

  activeLanguage = getActiveLanguage();
  LoadURLParameters();

  if (dataPath !== FILENAME_ZIP_ON_USER_INPUT)
    storageAdd(dataPath, STO_HELP);
  else {
    storageAddedNotification(dataPath, STO_HELP);
  }
});

EventBus.sub(EventNames.NavigationMove, (d) => {
  loadPageByTreeId(d.newId, d.treeId);
});

EventBus.sub(EventNames.ChapterShown, (d) => {
  revealTreeItem(`${N_P_TREEITEM}|${idxTreeItem}`);

  if (d.sourceObject) {
    if (resolveFileMedium(d.sourceObject.getAttribute('href')) == UserDataFileLoadedFileType.NETWORK) {
      setToHrefByValues((x) => {
        x.kvlist.set(PAR_NAME_ID, idxTreeItem);
      });
    } else {
      setToHref(d.sourceObject.href);
    }
  } else {
    setToHrefByValues((x) => {
      x.kvlist.set(PAR_NAME_PAGE, d.addressOrig);
      x.kvlist.set(PAR_NAME_ID, idxTreeItem);
    });
  }

  requestAnimationFrame(() => {
    const hash = location.hash;

    if (hash)
      sendEvent(evtHashDefined, (x) => x.result = hash.substring(1));
  });

});

showChapterByData(idxTreeItem, pagePath);
