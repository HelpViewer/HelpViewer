const STO_DATA = 'STO_DATA';
const STO_HELP = 'STO_HELP';
const STOF_TEXT = 'text';
const STOF_B64 = 'base64';

const STORAGE_ENGINES = {
  '.zip': async (path) => newStorageZip(path),
  '/': async (path) => newStorageDir(path),
};

var _Storage = (() => {
  var storagesC = new Map();

  async function add(key, path) {
    for (const keyC in STORAGE_ENGINES) {
      if (path.endsWith(keyC)) {
        const eng = await STORAGE_ENGINES[keyC](path);
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
    const fpath = `${storageO}/${filePath}`;
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

async function main() {
  var st = await _Storage.add(STO_DATA, 'hvdata/data.zip');
  const srcT = await _Storage.search(STO_DATA, 'appmainRun.js');
  appendJavaScript('appRun', srcT, document.body);
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
      const arrayBuffer = await fetchData(url);
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