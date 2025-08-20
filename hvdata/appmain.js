const DEBUG_MODE = false;
const DEBUG_MODE_RENDERER = DEBUG_MODE;
const LOG_MINIMIZE_OBJECT = true;
const LOG_MINIMIZE_DATE_ISO = false;

const $ = (name) => document.getElementById(name);
const $O = (selector, parent = document) => parent?.querySelector(selector);
const $A = (selector, parent = document) => parent?.querySelectorAll(selector);

function newUID(length = 8) {
  var str = '';

  while (str.length <= length)
    str += Math.random().toString(36).slice(2);

  str = str.slice(0, length);
  //log(`newUID of length ${length} emitted: ${str}`);

  return str;
}

const log = !DEBUG_MODE ? 
function log() {} : 
function log(msg, ...dataI) {
  if (!msg) return;

  var severity = msg[0];
  const hasSeverity = msg[1] == ' ';

  if (hasSeverity) {
    msg = msg.substring(2);
  } else {
    severity = undefined;
  }

  const data = [msg];

  if (LOG_MINIMIZE_OBJECT && severity?.toUpperCase() != 'E') {
    dataI.forEach((x, i) => {
      if (typeof x === 'object') {
        //dataI[i] = JSON.parse(JSON.stringify(x)); // unfortunately skips undefined members!
        const clean = Object.create(null);
        Object.assign(clean, dataI[i]);
        clean['__className'] = x.constructor.name;
        dataI[i] = clean;
        for (const [key, value] of Object.entries(dataI[i])) {
          if (value instanceof Date) {
            clean[key] = LOG_MINIMIZE_DATE_ISO ? value.toISOString() : value.toString();
          } else {
            clean[key] = value;
          }
        }
      }
    });
  }

  if (dataI.length > 0)
    data.push(...dataI);

  switch (severity?.toUpperCase()) {
    case 'W':
      console.warn(...data);
      break;

    case 'E':
      console.error(...data);
      break;
  
    default:
      if (hasSeverity) {
        msg = `${severity} ${msg}`;
        data[0] = msg;
      }
      console.log(...data);
      break;
  }
}

const PAR_NAME_DOC = 'd'; // Help file path

const id_JSAppRun = 'appRun';
const FILENAME_ZIP_ON_USER_INPUT = '!.zip';
const FILENAME_DIR_LISTING = '__dir.lst';

function _T(id) {
  return id;
}

const FormFieldType = {
  TEXT: 'text',
  CHECKBOX: 'checkbox',
  FILE: 'file',
};

function appendField(target, id, defaultV = '', type = FormFieldType.TEXT) {
  if (defaultV && type == FormFieldType.CHECKBOX)
    defaultV = `checked`;
  else if (defaultV)
    defaultV = `value="${defaultV}"`;
  else
    defaultV = '';

  target.insertAdjacentHTML('beforeend',
  `<div class="form-row">
      <label for="${id}" id="${id}-label">${_T(id)}</label>
      <input type="${type}" id="${id}" ${defaultV} />
  </div>`);
}

function appendFieldComboBox(target, id) {
  target.insertAdjacentHTML('beforeend',
  `<div class="form-row">
      <label for="${id}" id="${id}-label">${_T(id)}</label>
      <select id="${id}" />
  </div>`);
}

function appendComboBoxItems(combobox, items, defaultV) {
  if (!combobox) return;
  items?.forEach((txt, i) => {
    let opt = new Option(txt, i);
    if (defaultV == txt || defaultV == i)
      opt.selected = true;
    combobox.add(opt);
  });
}

function formCorsHelpFilesUpload(fieldHelpLangTitle = 'Help-(language).zip', fieldHvDataTitle = 'data.zip', formName = 'form', formInName = 'formIn')
{
  const formO = $(formInName);
  const fieldHvData = fieldHvDataTitle;
  const fieldHelpLang = fieldHelpLangTitle;
  //const fieldHelpBase = 'Help-.zip';
  const typeFile = FormFieldType.FILE;

  appendField(formO, fieldHvData, '', typeFile);
  appendField(formO, fieldHelpLang, '', typeFile);
  //appendField(formO, fieldHelpBase, '', typeFile);
  
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Send";
  formO.appendChild(button);

  const formM = $(formName);
  formM.addEventListener("submit", function(e) {
    e.preventDefault();

    const hvData = $(fieldHvData);
    const helpLang = $(fieldHelpLang);

    if (!hvData?.files?.length || !helpLang?.files?.length)
      return;

    const fileHvData = hvData.files[0];
    const fileHelpLang = helpLang.files[0];

    // var fileHelpBase = $(fieldHelpBase);

    // if (fileHelpBase?.files?.length)
    //   fileHelpBase = fileHelpBase[0];
    // else
    //   fileHelpBase = null;

    $(id_JSAppRun)?.remove();
    var st = _Storage.add(STO_HELP, FILENAME_ZIP_ON_USER_INPUT, fileHelpLang).then(obsah => {
      main(fileHvData);
      const url = new URL(window.location.href);
      url.searchParams.set(PAR_NAME_DOC, FILENAME_ZIP_ON_USER_INPUT);
      window.history.pushState({}, "", url);
    });

  })
}

const STO_DATA = 'STO_DATA';
const STO_HELP = 'STO_HELP';
const STOF_TEXT = 'text';
const STOF_B64 = 'base64';

const DATA_FILE_PATH_BASE = 'hvdata/data';

const STORAGE_ENGINES = {
  '.zip': async (path) => await new StorageZip().init(path),
  '/': async (path) => await new StorageDir().init(path),
};

var _Storage = (() => {
  var storagesC = new Map();

  async function add(key, path, data = null) {
    for (const keyC in STORAGE_ENGINES) {
      if (path.endsWith(keyC)) {
        const eng = await STORAGE_ENGINES[keyC](data || path);
        storagesC.set(key, eng);
        return true;
      }
    }
    return null;
  }

  async function search(key, filePath, format = STOF_TEXT) {
    if (!storagesC.has(key))
      return null;

    return await storagesC.get(key).search(filePath, format);
  }

  async function getSubdirs(key, parentPath) {
    if (!storagesC.has(key))
      return [];

    return await storagesC.get(key).getSubdirs(parentPath);
  }

  async function searchImage(key, filePath) {
    if (!storagesC.has(key))
      return null;

    return await storagesC.get(key).searchImage(filePath);
  }

  return {
    add,
    search,
    getSubdirs,
    searchImage
  };
})();

/**
 * @interface
 */
class IStorage {
  async init(path) {}
  async search(filePath, format) {}
  async getSubdirs(parentPath) {}
  async searchImage(filePath) {}
}

class StorageZip extends IStorage {
  constructor() {
    super();
    this.storageO = null;
  }
  
  async init(path) {
    this.storageO = await ZIPHelpers.loadZipFromUrl(path);
    return this;
  }

  async search(filePath, format = STOF_TEXT) {
    return await ZIPHelpers.searchArchiveForFile(filePath, this.storageO, format);
  }

  async getSubdirs(parentPath) {
    const subdirs = new Set();

    this.storageO?.forEach((relativePath, file) => {
      if (relativePath.startsWith(parentPath) && relativePath !== parentPath) 
      {
        const subPath = relativePath.slice(parentPath.length);
        const parts = subPath.split("/");
    
        if (parts.length > 1) {
          subdirs.add(parts[0]);
        } else if (file.dir) {
          subdirs.add(parts[0]);
        }
      }
    });
    
    return [...subdirs];
  }

  async searchImage(filePath) {
    const content = await this.search(filePath, STOF_B64);
    if (!content) return null;
    var mimeType = 'image/' + filePath.split('.').pop().toLowerCase();
    return `data:${mimeType};base64,${content}`;
  }
}

function toText(ab) {
  if (!ab) return '';
  if (typeof ab === 'string') return ab;
  if (ab instanceof String) return ab.valueOf();
  
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(ab);
  return text;
}

class StorageDir extends IStorage {
  constructor() {
    super();
    this.storageO = null;
  }
  
  async init(path) {
    this.storageO = path.replace(/\/$/, '');
    return this;
  }

  async search(filePath, format = STOF_TEXT) {
    var fpath = `${this.storageO}/${filePath}`;
    const doubleSlash = '//';
    const doubleSlashIndexLast = fpath.lastIndexOf(doubleSlash);
    const doubleSlashIndex = fpath.indexOf(doubleSlash);

    if (doubleSlashIndexLast != doubleSlashIndex && doubleSlashIndex >= 0 && doubleSlashIndexLast >= 0) {
      var replacement = '/_base/';
      if (fpath.startsWith('http') || fpath.startsWith('ftp'))
        replacement = '/';

      fpath = fpath.slice(0, doubleSlashIndexLast) + replacement + fpath.slice(doubleSlashIndexLast + 2);
    } else {
      if (!fpath.startsWith('http') && !fpath.startsWith('ftp'))
        fpath = fpath.replace(doubleSlash, '/');
    }

    const response = await this.fetchDataOrEmpty(fpath);

    switch (format) {
      case STOF_B64:
        const zip = new JSZip();
        const fname = "a.txt";
        zip.file(fname, response, { compression: "STORE" });
        const base64zip = await zip.generateAsync({ type: STOF_B64 });
        await zip.loadAsync(base64zip, { base64: true });
        const file = zip.file(fname);
        const b64Data = await file.async(STOF_B64);
        return b64Data;
      case STOF_TEXT:
      default:
        return toText(response);
    }
  }

  async getSubdirs(parentPath) {
    const list = await this.search(`${parentPath}/${FILENAME_DIR_LISTING}`, STOF_TEXT);
    var text = toText(list);
    text = rowsToArray(text.trim());

    const subdirs = new Set();
    text?.forEach((line, index) => {
      subdirs.add(line);
    });

    return [...subdirs];
  }

  async fetchDataOrEmpty(url) {
    try {
      const response = await fetchData(url);
      return response;
    } catch (error) {
      return new ArrayBuffer(0);
    }
  }

  async searchImage(filePath) {
    const fpath = `${this.storageO}/${filePath}`;
    const response = await this.fetchDataOrEmpty(fpath);
    if (response.byteLength == 0)
      return null;
    return fpath;
  }
}

async function main(baseDataStream = null) {
  var st = null;
  if (!baseDataStream) {
    try {
      st = await _Storage.add(STO_DATA, `${DATA_FILE_PATH_BASE}.zip`);
    } catch (error) {
      st = await _Storage.add(STO_DATA, `${DATA_FILE_PATH_BASE}/`);
    }  
  } else {
    st = await _Storage.add(STO_DATA, `${DATA_FILE_PATH_BASE}.zip`, baseDataStream);
  }
  const srcT = await _Storage.search(STO_DATA, 'appmainRun.js');
  appendJavaScript(id_JSAppRun, srcT, document.body);
  runApp();
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    throw error;
  }
}

const ZIPHelpers = (() => {
  async function loadZipFromUrl(url) {
    try {
      var arrayBuffer = null;
      if (typeof url === "string") {
        arrayBuffer = await fetchData(url);
      } else {
        arrayBuffer = await url.arrayBuffer();
      }
      const arch = await JSZip.loadAsync(arrayBuffer);
      return arch;
    } catch (error) {
      throw error;
    }
  }
  
  async function searchArchiveForFile(fileName, arch, format = STOF_TEXT) {
    try {
      const fileContent = await arch.file(fileName)?.async(format);
      return fileContent ?? "";
    } catch (error) {
      return "";
    }
  }

  return {
    loadZipFromUrl,
    searchArchiveForFile
  };
})();

function appendCSS(id, content) {
  //if ($(id)) return;
  const style = document.createElement('style');
  style.textContent = content;
  style.id = id;
  document.head.appendChild(style);
}

function appendJavaScript(id, content, parentO) {
  if ($(id)) return;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = content;
  script.id = id;
  parentO.appendChild(script);
}

function rowsToArray(t) {
  if (!t) return;
  return t.replace(/\r\n|\r/g, '\n').split('\n');
}

main();
