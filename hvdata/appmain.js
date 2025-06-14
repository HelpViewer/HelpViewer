const STO_DATA = 'STO_DATA';
const STO_HELP = 'STO_HELP';
const STOF_TEXT = 'text';
const STOF_B64 = 'base64';

var _Storage = (() => {
  var storagesC = new Map();

  async function add(key, path) {
    const zip = await ZIPHelpers.loadZipFromUrl(path);
    if (zip) {
      storagesC.set(key, zip);
      return true;
    }
    return null;
  }

  async function search(key, filePath, format = STOF_TEXT) {
    if (!storagesC.has(key))
      return null;

    return await ZIPHelpers.searchArchiveForFile(filePath, storagesC.get(key), format);
  }

  async function getSubdirs(key, parentPath) {
    if (!storagesC.has(key))
      return [];

    const subdirs = new Set();

    storagesC.get(key).forEach((relativePath, file) => {
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

  return {
    add,
    search,
    getSubdirs
  };
})();

async function main() {
  var st = await _Storage.add(STO_DATA, 'hvdata/data.zip');
  const srcT = await _Storage.search(STO_DATA, 'appmainRun.js');
  appendJavaScript('appRun', srcT, document.body);
  runApp();
}

const ZIPHelpers = (() => {
  async function loadZipFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
  
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