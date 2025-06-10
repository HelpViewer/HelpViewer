const FILENAME_LAYOUT = 'layout.htm';
const FILENAME_MAINCSS = 'main.css';
var FILENAME_DEFAULT_HELPFILE = 'hlp/Help-.zip';

async function initLayout(arcData) {
  const srcLayout = await searchArchiveForFile(FILENAME_LAYOUT, arcData);
  if (!srcLayout) return
  document.body.innerHTML = srcLayout;
  
  const srcMainCSS = await searchArchiveForFile(FILENAME_MAINCSS, arcData);
  if (!srcMainCSS) return
  appendCSS('mainCSS', srcMainCSS);
}

async function runApp() {
  initLayout(arcData);
  
  const sequence = ['appmainNext0.js', 'marked.min.js', 'appmainBaseLogic.js',
    'appLocalizationSwitcher.js',  'appmainHelpFileConfigFile.js',
    'appFTree.js', 'appFNavigation.js', 'appFColorTheme.js', 
    'appLayoutHandlers.js', 'appTopicRenderLogic.js',
    'appmainFileParsingTocTree.js', 'appFKeywordIndex.js', 'appmainNext.js'];

  for (const one of sequence) {
    const srcMarkedJs = await searchArchiveForFile(one, arcData);
    appendJavaScript(one, srcMarkedJs, document.head);
  }
}