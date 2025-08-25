"use strict";
const treeTOCName = 'tree';
const contentPane = $('content');

var pagePath = '';
var dataPath = '';

FILENAME_DEFAULT_HELPFILE = `hlp/Help-__.zip`;

var PRJNAME_VAL = null;

function showChapterByData(idxTreeItem, pagePath) {
  contentPane.innerHTML = _T('MSG_PATH_NOT_FOUND_IN_ARCH');
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
      
      revealTreeItem(elid);
    }
  }, undefined, 10000);
}

const PAR_NAME_PAGE = 'p'; // chapter page path

const KEY_LS_PRINTICONS = "printIcons";

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

LoadURLParameters();
const treeItemHandlerGet = () => idxTreeItem;

const BTN_CHANGEVERSION = 'downP-ChangeVersion';
const BTN_CHANGELANG = 'downP-ChangeLanguage';

const tree = $('tree');

window.addEventListener('popstate', () => {
  if (typeof dataPath !== 'string' || dataPath.trim() === '')
    dataPath = FILENAME_DEFAULT_HELPFILE;

  LoadURLParameters();
  showChapterByData(idxTreeItem, pagePath);
});

var languages = getLanguagesList();

loadLocalization(activeLanguage).then(() => {
  if (!dataPath)
    log(`Data file has not been specified. Use ?${PAR_NAME_DOC}= and its path in URI. Used default file name.`);
});

/*S: Topic renderer logic integration */
function convertRelativePathToViewerURI(val, id = undefined) {
  var pard = dataPathGeneral ? `&${PAR_NAME_DOC}=${dataPathGeneral}` : ``;
  var valParts = val.split('#');
  var hash = valParts.length < 2 ? '' : `#${valParts[1]}`;
  return `?${PAR_NAME_PAGE}=${encodeURIComponent(valParts[0])}&${PAR_NAME_ID}=${encodeURIComponent(id || idxTreeItem)}${pard}${hash}`;
}
/*E: Topic renderer logic integration */

class pAppmainNext extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    const TI = this;

    //HASHDEFINED
    const h_EVT_HASHDEFINED = (d) => {
      scrollToAnchor(d.result);
    };
    TI.eventDefinitions.push([evtHashDefined, IEvent, h_EVT_HASHDEFINED]);

    super.init();
  }

  deInit() {
    super.deInit();
  }

  async onETPluginsLoadingFinished(d) {
    if (DEBUG_MODE) {
      log('W Application is in DEBUG_MODE, debug tools will be attached. Turn DEBUG_MODE to off in hvdata/appmain.js file for work in production.');
      const objExplorerName = 'puiButtonObjectExplorer';
      await loadPlugin(objExplorerName, loadPluginListBasePath(objExplorerName));
      await activatePlugin(objExplorerName, '-load');
      loadLocalization(getActiveLanguage());
    }
  }

  onETIndexFileLoaded(d) {
    if (pagePath.startsWith('@'))
      showChapterByData(idxTreeItem, pagePath);
  }

  onETStorageAdded(d) {
    if (d.storageName != STO_HELP)
      return;
  
    notifyUserDataFileLoaded(d.fileName);
  }

  onETClickedEventTree(d) {
    if (d.treeId != 'tree' && d.treeId != 'bmark' && d.treeId != 'objectList') 
      return;
  
    idxTreeItem = d.elementIdVal;
    sendEvent(evtHideIfTooWide);
  }

  //evtHideIfTooWide
  onETHIDEIFTOOWIDE(d) {
    const sidebar = $('sidebar');
    if (sidebar.classList.contains(C_TOOWIDE) && !sidebar.classList.contains(C_HIDDENC))
      toggleSidebar();
  }

  onETUserDataFileLoaded(d) {
    configFileReload(FILE_CONFIG);
    showChapterByData(idxTreeItem, pagePath);
    showSidebarTab();
  }

  onETClickedEventNotForwarded(d) {
    if (!d.target)
      d.stop = true;
  
    const a = d.target.closest('a');
    if (!d.target.closest('a, input, summary, button'))
      d.stop = true;
  
    if (d.target.closest('label'))
      return;
  
    if (d.stop) {
      d.event.preventDefault();
      return;
    }
  
    if (a)
      processAClick(a, d);
  }

  onETConfigFileReloadFinished(d) {
    (async () => {
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
        const cssName = 'overridePlusMinus';
        $(cssName)?.remove();
        appendCSS(cssName,
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

  onETBeforePrint(d) {
    removeIconsForPrint();
  }

  //EventNames.LOC_LOADED
  onETLOC_LOADED(d) {
    setPanelsEmpty();

    activeLanguage = getActiveLanguage();
    LoadURLParameters();
  
    if (dataPath !== FILENAME_ZIP_ON_USER_INPUT)
      storageAdd(dataPath, STO_HELP);
    else {
      storageAddedNotification(dataPath, STO_HELP);
    }
  }

  onETNavigationMove(d) {
    loadPageByTreeId(d.newId, d.treeId);
  }

  onETChapterShown(d) {
    revealTreeItem(`${N_P_TREEITEM}|${idxTreeItem}`);

    if (d.addressOrig.toLowerCase() != '~changelog.md') {
      if (d.sourceObject) {
        if (resolveFileMedium(d.sourceObject.getAttribute('href')) == UserDataFileLoadedFileType.NETWORK) {
          setToHrefByValues((x) => {
            x.kvlist.set(PAR_NAME_ID, idxTreeItem);
          });
        } else {
          setToHref(d.sourceObject.href);
        }
      } else {
        // setToHrefByValues((x) => {
        //   x.kvlist.set(PAR_NAME_PAGE, d.addressOrig);
        //   x.kvlist.set(PAR_NAME_ID, idxTreeItem);
        // });
      }
    }
  
    requestAnimationFrame(() => {
      const hash = location.hash;
  
      if (hash)
        sendEvent(evtHashDefined, (x) => x.result = hash.substring(1));
    });
  
    contentPane.focus();
    refreshTitlesForLangStrings();
  }

}

Plugins.catalogize(pAppmainNext);
const plgName = 'pAppmainNext';
const plgAlias = '';
activatePlugin(plgName, plgAlias).then(() => sendEvent(EVT_PluginsLoadingFinished));
