const FILENAME_LAYOUT = 'layout.htm';
const FILENAME_MAINCSS = 'main.css';
var FILENAME_DEFAULT_HELPFILE = 'hlp/Help-.zip';

async function initLayout(store) {
  const srcLayout = await _Storage.search(store, FILENAME_LAYOUT);
  if (!srcLayout) return
  document.body.innerHTML = srcLayout;
  
  const srcMainCSS = await _Storage.search(store, FILENAME_MAINCSS);
  if (!srcMainCSS) return
  appendCSS('mainCSS', srcMainCSS);
}

async function runApp() {
  initLayout(STO_DATA);
  
  const sequence = ['appmainNext0.js', 'marked.min.js', 'appEventBus.js', 'appmainBaseLogic.js',
    'appLocalizationSwitcher.js',  'appmainHelpFileConfigFile.js', 'appGHIntegration.js', 
    'appFTree.js', 'appFNavigation.js', 'appFColorTheme.js', 
    'appLayoutHandlers.js', 'appTopicRenderLogic.js',
    'appmainFileParsingTocTree.js', 'appFKeywordIndex.js', 'appmainNext.js'];

  for (const one of sequence) {
    const srcMarkedJs = await _Storage.search(STO_DATA, one);
    appendJavaScript(one, srcMarkedJs, document.head);
  }
}