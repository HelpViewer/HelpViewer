const PAR_NAME_DOC = 'd'; // Help file path

const id_JSAppRun = 'appRun';
const FILENAME_ZIP_ON_USER_INPUT = '!.zip';

function _T(id) {
  return id;
}

function appendField(target, id, defaultV = '', type = 'text') {
  target.innerHTML += 
  `<div class="form-row">
      <label for="${id}">${_T(id)}</label>
      <input type="${type}" id="${id}" value="${defaultV}" />
  </div>`;
}

function formCorsHelpFilesUpload()
{
  const formO = document.getElementById('formIn');
  const fieldHvData = 'data.zip';
  const fieldHelpLang = 'Help-(language).zip';
  //const fieldHelpBase = 'Help-.zip';
  const typeFile = 'file';

  appendField(formO, fieldHvData, '', typeFile);
  appendField(formO, fieldHelpLang, '', typeFile);
  //appendField(formO, fieldHelpBase, '', typeFile);

  const formM = document.getElementById('form');
  formM.addEventListener("submit", function(e) {
    e.preventDefault();

    const hvData = document.getElementById(fieldHvData);
    const helpLang = document.getElementById(fieldHelpLang);

    if (!hvData?.files?.length || !helpLang?.files?.length)
      return;

    const fileHvData = hvData.files[0];
    const fileHelpLang = helpLang.files[0];

    // var fileHelpBase = document.getElementById(fieldHelpBase);

    // if (fileHelpBase?.files?.length)
    //   fileHelpBase = fileHelpBase[0];
    // else
    //   fileHelpBase = null;

    document.getElementById(id_JSAppRun)?.remove();
    st = _Storage.add(STO_HELP, FILENAME_ZIP_ON_USER_INPUT, fileHelpLang).then(obsah => {
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
  '.zip': async (path) => newStorageZip(path),
  '/': async (path) => newStorageDir(path),
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

async function newStorageZip(path) {
  var storageO = await init(path);

  async function init(path) {
    return await ZIPHelpers.loadZipFromUrl(path);
  }

  async function search(filePath, format = STOF_TEXT) {
    return await ZIPHelpers.searchArchiveForFile(filePath, storageO, format);
  }

  async function getSubdirs(parentPath) {
    const subdirs = new Set();

    storageO?.forEach((relativePath, file) => {
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

  async function searchImage(filePath) {
    const content = await search(filePath, STOF_B64);
    if (!content) return null;
    var mimeType = 'image/' + filePath.split('.').pop().toLowerCase();
    return `data:${mimeType};base64,${content}`;
  }

  return {
    search,
    getSubdirs,
    searchImage
  };
}

async function newStorageDir(path) {
  var storageO = await init(path);

  async function init(path) {
    return path.replace(/\/$/, '');
  }
  async function search(filePath, format = STOF_TEXT) {
    var fpath = `${storageO}/${filePath}`;
    const doubleSlash = '//';
    const doubleSlashIndexLast = fpath.lastIndexOf(doubleSlash);
    const doubleSlashIndex = fpath.indexOf(doubleSlash);

    if (doubleSlashIndexLast != doubleSlashIndex && doubleSlashIndex >= 0 && doubleSlashIndexLast >= 0) {
      var replacement = '/_base/';
      if (fpath.startsWith('http') || fpath.startsWith('ftp'))
        replacement = '/';

      fpath = fpath.slice(0, doubleSlashIndexLast) + replacement + fpath.slice(doubleSlashIndexLast + 2);
    }

    const response = await fetchDataOrEmpty(fpath);

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

  function toText(ab) {
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(ab);
    return text;
  }

  async function getSubdirs(parentPath) {
    const list = search(`${storageO}/${parentPath}/__dir.lst`, format = STOF_TEXT);
    const text = toText(list);
    text = text.trim().replace(/\r\n/g, "\n").split('\n');

    const subdirs = new Set();
    text?.forEach((line, index) => {
      subdirs.add(line);
    });

    return [...subdirs];
  }

  async function fetchDataOrEmpty(url) {
    try {
      const response = await fetchData(url);
      return response;
    } catch (error) {
      return new ArrayBuffer(0);
    }
  }

  async function searchImage(filePath) {
    const fpath = `${storageO}/${filePath}`;
    const response = await fetchDataOrEmpty(fpath);
    if (response.byteLength == 0)
      return null;
    return fpath;
  }

  return {
    search,
    getSubdirs,
    searchImage
  };
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
  //if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.textContent = content;
  style.id = id;
  document.head.appendChild(style);
}

function appendJavaScript(id, content, parentO) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = content;
  script.id = id;
  parentO.appendChild(script);
}

main();