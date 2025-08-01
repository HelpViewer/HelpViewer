const C_HIDDENC = 'hidden';
const FILENAME_1STTOPIC = 'README.md';
const FILENAME_CONFIG = '_config.txt';

const CFG_KEY__VERSION = '_version';
const CFG_KEY__PRJNAME = '_prjname';
const CFG_KEY__LANG = '_lang';

const FILENAME_BOOKO = 'book-open.png';
const FILENAME_BOOKC = 'book-closed.png';
const FILENAME_FAVICON = 'favicon.png';

const UI_PLUGIN_SIDEBAR = 'sidebar';
const UI_PLUGIN_HEADER = 'header';

function nameForAnchor(text, level, levelCounter) {
  return `h-${level}-${levelCounter}`;
  // return text.toLowerCase()
  //   .trim()
  //   .replace(/[^\w\s-]/g, '')
  //   .replace(/\s+/g, '-')
  //   .replace(/-+/g, '-');
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
  return sendEventWProm('EVT_STORAGE_GET_SUBDIRS', (input) => {
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
  doc.querySelectorAll(`img${exclude}`).forEach((img) => {
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
  var link = document.querySelector("link[rel~='icon']");
  
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

function setToBookmark(bookmark) {
  sendEvent(EventNames.GetsSetToBookmark, (d) => {
    d.bookmark = bookmark;
  });
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
function setHeader(txt) {
  return sendEvent('HeaderSet', (x) => x.payload = txt);
}

function getHeader() {
  return sendEvent('HeaderGet');
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

/*E: Plugin: puiSidebarVisibilityToggle */
function toggleSidebar(newVisibility) {
  return sendEvent(EventNames.SidebarVisibilitySet, (x) => {
    x.value = newVisibility;
    x.id = UI_PLUGIN_SIDEBAR;
  });
}
/*E: Plugin: puiSidebarVisibilityToggle */

/*E: Plugin: puiButtonTabTree */
function setTreeData(data, target, append = false) {
  return sendEvent(EventNames.SetTreeData, (x) => {
    x.data = data;
    x.targetTree = target;
    x.append = append;
  });
}
/*E: Plugin: puiButtonTabTree */

/*E: Plugin: pChapterIndexFile */
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
/*E: Plugin: pChapterIndexFile */
