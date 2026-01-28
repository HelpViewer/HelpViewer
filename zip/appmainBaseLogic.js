const C_HIDDENC = 'hidden';
const C_SCREENREADERONLY = 'sronly';

const C_HIDDENCPRESMODE = 'hiddenPresmode';
const C_HIDDENCPRINT = 'hiddenprint';
const C_NOTRANSITION = 'notransition';
const C_BOTTOMPANEL = 'bottomPanel';

const FILENAME_1STTOPIC = 'README.md';
const FILENAME_CONFIG = '_config.txt';

const CFG_KEY__VERSION = '_version';
const CFG_KEY__PRJNAME = '_prjname';
const CFG_KEY__LANG = '_lang';

const FILENAME_BOOKO = 'book-open.png';
const FILENAME_BOOKC = 'book-closed.png';
const FILENAME_SIBLING = 'tree-sibling.png';
const FILENAME_FAVICON = 'favicon.png';

const UI_PLUGIN_SIDEBAR = 'sidebar';
const UI_PLUGIN_HEADER = 'header';
const UI_PLUGIN_BOTTOM = 'bottom';
const UI_PLUGIN_TOP = 'top';

const MARKER_MARKWORD = '@@';

const EventIdDynamic = '[D]';

const ID_DOWNLOADLINK = 'downloadLink';

const DIRECTIVE_PRINT_PAGEBREAK = '<!-- @print-break -->';

const ChapterContentType = {
  CHAPTER_SOURCE: 'CHAPTER_SOURCE',
  KEYWORD_LIST: 'KEYWORD_LIST',
  INTERNAL_RESOURCE: 'INTERNAL_RESOURCE',
  NETWORK_RESOURCE: 'NETWORK_RESOURCE',
};

function valKiBs(size) {
  return roundToDecPlaces(size / 1024, 2);
}

function roundToDecPlaces(number, places) {
  const placesN = Math.pow(10, places);
  return Math.round(number * placesN) / placesN;
}

function textCleanupPhrase(p) {
  if (!p) return '';
  return p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function stripTags(htmlString, cleanJS = true) {
  var div = document.createElement("div");
  div.innerHTML = htmlString;
  
  if (cleanJS)
    div.innerHTML = div.innerHTML.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  return div.innerText;
}

function stripTagsSome(htmlString, tags) {
  if (!tags || tags.length == 0)
    return htmlString;

  const pattern = tags.join('|');
  // if (!pattern)
  //   return stripTags(htmlString);
  const regex = new RegExp(`<(${pattern})[^>]*>(.*?)<\/\\1>|<(${pattern})[^>]*\\/?>`, 'gi');
  return htmlString.replace(regex, '');
}

const UserDataFileLoadedFileType = {
  LOCALDIR: 'LOCALDIR',
  LOCALARC: 'LOCALARC',
  INPUTFIELD: 'INPUTFIELD',
  NETWORK: 'NETWORK'
};

function resolveFileMedium(fileName) {
  if (!fileName)
    return undefined;
  
  if (fileName === FILENAME_ZIP_ON_USER_INPUT) {
    return UserDataFileLoadedFileType.INPUTFIELD;
  } else if (/^(https?|ftp):\/\//i.test(fileName)) {
    return UserDataFileLoadedFileType.NETWORK;
  } else if (fileName.endsWith('.zip')) {
    return UserDataFileLoadedFileType.LOCALARC;
  } else if (fileName.endsWith('/')) {
    return UserDataFileLoadedFileType.LOCALDIR;
  }
}

class UserDataFileLoaded extends IEvent {
  constructor() {
    super();
    this.fileName = undefined;
    this.fileMedium = undefined;
  }
}

{
  const name = UserDataFileLoaded.name;
  const dataClass = UserDataFileLoaded;
  addEventDefinition(name, new EventDefinition(dataClass, name));
}

function notifyUserDataFileLoaded(fileName) {
  sendEvent(EventNames.UserDataFileLoaded, (ed) => {
    ed.fileName = fileName;
    ed.fileMedium = resolveFileMedium(fileName);
  });
}

function dataUrlRawDataToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(",");

  const mime = meta.match(/:(.*?);/)[1];
  const binary = atob(base64);

  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

/*S: Zip archive reading functions */
function storageAdd(filePath, storageName, fileData = undefined) {
  return sendEventWProm(EventNames.StorageAdd, (input) => {
    input.fileName = filePath;
    input.fileData = fileData;
    input.storageName = storageName;
  });
}

function storageAddedNotification(fileName, storageName) {
  sendEvent(EventNames.StorageAdded, (evt) => {
    evt.fileName = fileName;
    evt.storageName = storageName;
  });
}

function storageSearch(key, filePath, format = STOF_TEXT) {
  return sendEventWProm(EventNames.StorageGet, (input) => {
    input.fileName = filePath;
    input.storageName = key;
    input.format = format;
  });
}

function storageGetSubdirs(key, filePath) {
  return sendEventWProm(EventNames.StorageGetSubdirs, (input) => {
    input.fileName = filePath;
    input.storageName = key;
  });
}

function getDataOfPathInZIPImage(path, archive) {
  return sendEventWProm(EventNames.StorageGetImages, (input) => {
    input.fileName = path;
    input.storageName = archive;
  });
}
/*E: Zip archive reading functions */

/*S: Fixing local in archive paths to base64 dump*/
function fixImgRelativePathToZipPaths(doc, archive, exclude = '')
{
  $A(`img${exclude}`, doc).forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^https?:\/\//.test(src)) {
      getDataOfPathInZIPImage(src, archive).then((data) => {
        if (data)
          img.src = data;
      });
    }
  });
}
/*E: Fixing local in archive paths to base64 dump*/

function changeFavicon(src) {
  var link = $O("link[rel~='icon']");
  
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = src;
}

/*S: Plugin: pGets */
function setToHref(uri) {
  sendEvent(EventNames.GetsSetHref, (d) => {
    d.href = uri;
  });
}

function getGets(name, handler = null) {
  return sendEvent(EventNames.GetsGet, (d) => {
    d.name = name;
    d.conversionHandler = handler;
  });
}

function setToHrefByValues(init) {
  sendEvent(EventNames.GetsSet, init);
}
/*E: Plugin: pGets */

/*S: Plugin: pUserConfig */
function getUserConfigValue(key) {
  return sendEvent(EventNames.UserConfigGet, (d) => {
    d.key = key;
  });
}

function setUserConfigValue(key, value) {
  sendEvent(EventNames.UserConfigSet, (d) => {
    d.key = key;
    d.value = value
  });
}
/*E: Plugin: pUserConfig */

/*S: Plugin: pColorTheme */
function getCurrentColorMode() {
  return sendEvent(EventNames.ColorThemeGet);
}

function setColorMode(colorTheme = undefined) {
  sendEvent(EventNames.ColorThemeSet, (d) => {
    d.name = colorTheme;
  });
}
/*E: Plugin: pColorTheme */

/*S: Plugin: pPluginManagement */
function getPluginsState() {
  return sendEvent('PluginsDump');
}
/*E: Plugin: pPluginManagement */

/*S: Plugin: puiHeader */
function setHeader(txt, id = UI_PLUGIN_HEADER) {
  return sendEvent('HeaderSet', (x) => {
    x.payload = txt;
    x.id = id;
  });
}

function getHeader(id = UI_PLUGIN_HEADER) {
  return sendEvent('HeaderGet', (x) => x.id = id);
}
/*E: Plugin: puiHeader */

const H_BUTTON_WITH_TAB = 'H_BUTTON_WITH_TAB';

/**
 * @param {null | Function | H_BUTTON_WITH_TAB} [handler]
 * @returns For handler not equal to H_BUTTON_WITH_TAB button HTML element, for handler equal to H_BUTTON_WITH_TAB HTML element array of [button, page]
 */
/*S: Plugin: pui */
function uiAddButton(id, caption, target, handler = null) {
  const button = sendEvent(EventNames.ButtonCreate, (x) => {
    x.buttonId = id;
    x.caption = caption;

    if (handler && handler != H_BUTTON_WITH_TAB)
      x.handler = handler;
  });

  sendEvent(EventNames.ButtonSend, (x) => {
    x.button = button;
    x.id = target;
  });

  if (handler === H_BUTTON_WITH_TAB)
    return [button, uiAddSidebarPage(id)];

  return button;
}
/*E: Plugin: pui */

/*S: Plugin: puiSidebar */
function uiAddSidebarPage(id, role) {
  return sendEvent(EventNames.SidebarPageCreate, (x) => {
    x.pageId = id;
    x.role = role;
    x.id = UI_PLUGIN_SIDEBAR;
  });
}

function uiAddTreeView(id, page) {
  return sendEvent(EventNames.TreeViewCreate, (x) => {
    x.page = page;
    x.treeViewId = id;
    x.id = UI_PLUGIN_SIDEBAR;
  });
}

function showSidebarTab(id) {
  //TODO: Temporary
  if (id)
    id = id.startsWith('sp-') ? id.substring(3) : id;
  
  return sendEvent(EventNames.SidebarPageShow, (x) => {
    x.pageId = id;
    x.id = UI_PLUGIN_SIDEBAR;
  });
}

function toggleSidebarSide() {
  return sendEvent(EventNames.EVT_SIDE_SIDE_TOGGLE, (x) => {
    x.id = UI_PLUGIN_SIDEBAR;
  });
}
/*E: Plugin: puiSidebar */

/*S: Plugin: puiSidebarVisibilityToggle */
function toggleSidebar(newVisibility) {
  return sendEvent(EventNames.SidebarVisibilitySet, (x) => {
    x.value = newVisibility;
    x.id = UI_PLUGIN_SIDEBAR;
  });
}
/*E: Plugin: puiSidebarVisibilityToggle */

/*S: Plugin: puiButtonTabTree */
function setTreeData(data, id = undefined, append = false) {
  return sendEvent(EventNames.SetTreeData, (x) => {
    x.data = data;
    x.append = append;
    x.id = id;
  });
}
/*E: Plugin: puiButtonTabTree */

/*S: Plugin: pChapterIndexFile */
function getChapterAlternativeHeading(chapterPath) {
  return sendEvent(EventNames.ChapterIndexFileGetData, (x) => {
    x.key = chapterPath;
  });
}

function setChapterIndex(data) {
  return sendEvent(EventNames.ChapterIndexFileSetData, (x) => {
    x.data = data;
  });
}

function getChapterIndexData() {
  return sendEvent('ChapterIndexFileGetDataAll');
}
/*E: Plugin: pChapterIndexFile */

/*S: Plugin: pIndexFile */
function getIndexFileData(id, key, count = null) {
  const KEY_LS_KWLISTINGCOUNT = "keywordListingCount";
  var listingCount = count || parseInt(getUserConfigValue(KEY_LS_KWLISTINGCOUNT)) || 50;

  if (count === undefined)
    listingCount = count;

  return sendEvent(EventNames.IndexFileGetData, (x) => {
    x.id = id;
    x.key = key;
    x.cap = listingCount;
  });
}

function setIndexFileData(id, keywords, mapping) {
  return sendEvent(EventNames.IndexFileSetData, (x) => {
    x.id = id;
    x.keywords = keywords;
    x.mapping = mapping;
  });
}

function getIndexFileKeywordData(id, keyword) {
  return sendEvent(EventNames.IndexFileGetKeywordData, (x) => {
    x.id = id;
    x.key = keyword;
  });
}
/*E: Plugin: pIndexFile */

/*S: Plugin: pTopicRenderer */
function showChapterA(event, a) {
  const href = a.getAttribute('href');//a.href
  return showChapter(event, 
    a.innerHTML, 
    a.getAttribute('data-param') || href, a);
}

function showChapter(event, heading, address, sourceObject, content, id = undefined, container = undefined) {
  return sendEvent(EventNames.ShowChapter, (x) => {
    x.event = event;
    x.heading = heading;
    x.address = address;
    x.sourceObject = sourceObject;
    x.helpFile = dataPath;
    x.content = content;

    if (id)
      x.id = id;
    
    // x.parentEvent = parentEvent;
    // x.parentEventId = parentEvent.eventId || undefined;
    // x.containerIdTitle = undefined;
    x.containerIdContent = container;
  });
}
/*E: Plugin: pTopicRenderer */

/*S: Plugin: puiButtonHome */
function getHomePageData() {
  return sendEvent('GetHomePageData');
}
/*E: Plugin: puiButtonHome */

const evtHideIfTooWide = 'HIDEIFTOOWIDE';

function processAClick(a, evt) {
  if (!a)
    return;

  if (a.id == ID_DOWNLOADLINK)
    return;

  revealTreeItem(a?.id);

  const origHref = a.getAttribute('href');

  if (!origHref) {
    evt?.event?.preventDefault();
    return;
  }

  if (origHref.startsWith('#')) {
    evt?.event?.preventDefault();
    const bookmark = origHref.substring(1);
    scrollToAnchor(bookmark);
    history.pushState(null, '', origHref);
    sendEvent(evtHideIfTooWide);
    return;
  }

  if (origHref.startsWith(`?${PAR_NAME_DOC}=`)) {
    log(`Resolution: ${evt.eventId};${origHref} ... is external help file.`);
    return;
  }

  if (resolveFileMedium(origHref) !== UserDataFileLoadedFileType.NETWORK)
  {
    log(`Resolution: ${evt.eventId};${origHref} ... is local/relative path in help file.`);
    evt?.event?.preventDefault();
  }

  const pageStr = new URLSearchParams(origHref).get(PAR_NAME_PAGE);
  if (/(\.(md|htm|html))?$/i.test(pageStr))
    showChapterA(evt, a);
}

function getHelpListingFiles(handlerOverData, readme1st = true) {
  const tocData = sendEvent('GetTOCData') || Promise.resolve('');
  const homeData = getHomePageData() || '';
  const chapters = getChapterIndexData() || Promise.resolve('');

  var files = [];

  Promise.all([tocData, chapters]).then(([x, chapt]) => {
    const tmpDiv = document.createElement('div');
    const tree = linesToHtmlTree(x.trim(), 'TTMP');
    tmpDiv.innerHTML = tree;

    var treeConversion = [];

    for (const o of $A('a', tmpDiv)) {
      const href = o.getAttribute('href');
      const pageStr = new URLSearchParams(href).get(PAR_NAME_PAGE) || href;
      treeConversion.push(`${pageStr}|${o.innerText}`);
    }

    treeConversion = treeConversion.filter((o) => o && !(/^(ftp|http|\?d=|=)/.test(o)));
    treeConversion = [...(rowsToArray(chapt) || []), ...treeConversion];
    files.push(...treeConversion);
  })
  .then(() => {
    var filesParsed = new Map();
    files.forEach((x) => {
      const pair = x.split('|');

      if (pair[0] && !filesParsed.has(pair[0]))
        filesParsed.set(pair[0], pair[1]);
    });

    var homeDataPair = [homeData, homeData];

    if (filesParsed.has(homeData))
      homeDataPair = [homeData, filesParsed.get(homeData)];
    else 
      filesParsed.set(homeData, homeData);

    if (readme1st) {
      filesParsed.delete(homeData);
      files = new Map([homeDataPair, ...filesParsed]);
    } else
      files = filesParsed;

  })
  .then(() => handlerOverData?.(files, homeData));
}

function groupBy(data, keyGetter) {
  const grouped = data.reduce((acc, e) => {
    const key = keyGetter(e);
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return grouped;
}

function insertToStringAtIndex(str, index, insertedText) {
  if (index < 0 || index > str.length) return str;
  return str.slice(0, index) + insertedText + str.slice(index);
}

/*S: Plugin: puiWatermark */
function setWatermark(content, id = '') {
  return sendEvent(EventNames.WatermarkSet, (ed) => {
    ed.payload = content;
    ed.id = id;
  });
}
/*E: Plugin: puiWatermark */
