const FILENAME_LAYOUT = 'layout.htm';
const FILENAME_MAINCSS = 'main.css';
const FILENAME_JSBACKEND = 'appmainNext.js'
const FILENAME_MAINCSS_PLUS = 'plus.css';
const FILENAME_JSBACKEND_PLUS = 'plus.js';

var FILENAME_DEFAULT_HELPFILE = 'hlp/Help-.zip';

var srcJSOverride = null;
var srcMainCSSPlus = null;
var srcJSOverridePlus = null;

async function initLayout(store) {
  const srcLayout = await _Storage.search(store, FILENAME_LAYOUT);
  if (!srcLayout) return
  document.body.innerHTML = srcLayout;
  
  const srcMainCSS = await _Storage.search(store, FILENAME_MAINCSS);
  if (!srcMainCSS) return
  appendCSS('mainCSS', srcMainCSS);
}

async function runApp() {
  const sequenceCSS = [ 'prism/prism.css', 'prism/override.css' ];

  for (const one of sequenceCSS) {
    const srcCSS = await _Storage.search(STO_DATA, one);
    appendCSS(one, srcCSS);
  }

  initLayout(STO_DATA);
  
  const sequence = ['appmainNext0.js', 'marked.min.js', 'appmainBaseLogic.js',
    'appLocalizationSwitcher.js',  'appmainHelpFileConfigFile.js', 'appGHIntegration.js', 
    'appFTree.js', 'appFNavigation.js', 'appFColorTheme.js', 
    'appLayoutHandlers.js', 'prism/prism.js', 'appTopicRenderLogic.js',
    'appmainFileParsingTocTree.js', 'appFKeywordIndex.js'];

  for (const one of sequence) {
    const srcMarkedJs = await _Storage.search(STO_DATA, one);
    appendJavaScript(one, srcMarkedJs, document.head);
  }

  if (!srcJSOverride)
    srcJSOverride = await _Storage.search(STO_DATA, FILENAME_JSBACKEND);
  
  appendJavaScript(FILENAME_JSBACKEND, srcJSOverride, document.head);

  if (srcMainCSSPlus)
    appendCSS('mainCSSPlus', srcMainCSSPlus);

  if (srcJSOverridePlus)
    appendJavaScript('mainJSPlus', srcJSOverridePlus, document.head);
}