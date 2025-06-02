let arcData = null;

async function main() {
  arcData = await loadZipFromUrl('hvdata/data.zip');
  const srcAppmainNext = await searchArchiveForFile('appmainNext.js', arcData);
  appendJavaScript('appNext', srcAppmainNext, document.body);
  runApp();
}

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

async function searchArchiveForFile(fileName, arch) {
  try {
    const fileContent = await arch.file(fileName)?.async('text');
    return fileContent ?? "";
  } catch (error) {
    return "";
  }
}

function appendCSS(id, content) {
  const style = document.createElement('style');
  style.textContent = content;
  style.id = id;
  document.head.appendChild(style);
}

function appendJavaScript(id, content, parentO) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = content;
  script.id = id;
  parentO.appendChild(script);
}

main();