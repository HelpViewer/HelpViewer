const FILENAME_LAYOUT = 'layout.htm';
const FILENAME_MAINCSS = 'main.css';
const FILENAME_JSBACKEND = 'appmainNext.js'

var FILENAME_DEFAULT_HELPFILE = 'hlp/Help-.zip';

var srcJSOverride = null;

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
  
  const sequence = ['appmainNext0.js', 'marked.min.js', 'appmainBaseLogic.js',
    'appLocalizationSwitcher.js',  'appmainHelpFileConfigFile.js', 'appGHIntegration.js', 
    'appFTree.js', 'appFNavigation.js', 'appFColorTheme.js', 
    'appLayoutHandlers.js', 'appTopicRenderLogic.js',
    'appmainFileParsingTocTree.js', 'appFKeywordIndex.js'];

  for (const one of sequence) {
    const srcMarkedJs = await _Storage.search(STO_DATA, one);
    appendJavaScript(one, srcMarkedJs, document.head);
  }

  if (!srcJSOverride)
    srcJSOverride = await _Storage.search(STO_DATA, FILENAME_JSBACKEND);
  
  appendJavaScript(FILENAME_JSBACKEND, srcJSOverride, document.head);
}