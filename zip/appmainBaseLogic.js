const C_HIDDENC = 'hidden';
const FILENAME_1STTOPIC = 'README.md';
const FILENAME_CONFIG = '_config.txt';

const CFG_KEY__VERSION = '_version';
const CFG_KEY__PRJNAME = '_prjname';
const CFG_KEY__LANG = '_lang';

const FILENAME_BOOKO = 'book-open.png';
const FILENAME_BOOKC = 'book-closed.png';
const FILENAME_FAVICON = 'favicon.png';

function nameForAnchor(text, level, levelCounter) {
  return `h-${level}-${levelCounter}`;
  // return text.toLowerCase()
  //   .trim()
  //   .replace(/[^\w\s-]/g, '')
  //   .replace(/\s+/g, '-')
  //   .replace(/-+/g, '-');
}

/*S: Zip archive reading functions */

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
