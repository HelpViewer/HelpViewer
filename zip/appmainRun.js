const FILENAME_LAYOUT = 'layout.htm';
const FILENAME_MAINCSS = 'main.css';
const FILENAME_JSBACKEND = 'appmainNext.js'
const FILENAME_MAINCSS_PLUS = 'plus.css';
const FILENAME_JSBACKEND_PLUS = 'plus.js';
const FILENAME_LIST_JS = 'js.lst';
const FILENAME_LIST_CSS = 'css.lst';
const FILENAME_LIST_JS_PLUGINS = 'plugins.lst';

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
  var listData = await _Storage.search(STO_DATA, FILENAME_LIST_CSS);
  const sequenceCSS = rowsToArray(listData.trim());

  for (const one of sequenceCSS) {
    const srcCSS = await _Storage.search(STO_DATA, one);
    appendCSS(one, srcCSS);
  }

  initLayout(STO_DATA);

  listData = await _Storage.search(STO_DATA, FILENAME_LIST_JS);
  const sequence = rowsToArray(listData.trim());

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

  listData = await _Storage.search(STO_DATA, FILENAME_LIST_JS_PLUGINS);
  const sequencePlugins = rowsToArray(listData.trim());

  for (const one of sequencePlugins) {
    const names = one.split(':');
    const name = names[0];
    var aliases = [];

    if (names.length > 1)
      aliases = names[1].split(';');

    if (aliases.length == 0)
      aliases.push('');

    const srcMarkedJs = await _Storage.search(STO_DATA, `plugins/${name}.js`);
    appendJavaScript(`plugins-${name}.js`, srcMarkedJs, document.head);

    for (const oneAlias of aliases) {
      Plugins.activate(name, oneAlias, {});
    }
  }

}