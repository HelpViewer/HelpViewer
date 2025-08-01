const FILENAME_LAYOUT = 'layout.htm';
const FILENAME_MAINCSS = 'main.css';
const FILENAME_JSBACKEND = 'appmainNext.js'
const FILENAME_MAINCSS_PLUS = 'plus.css';
const FILENAME_JSBACKEND_PLUS = 'plus.js';
const FILENAME_LIST_JS = 'js.lst';
const FILENAME_LIST_CSS = 'css.lst';
const FILENAME_LIST_JS_PLUGINS = 'plugins.lst';

const EVT_PluginsLoadingFinished = 'PluginsLoadingFinished';

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

    await loadPlugin(name, `plugins/${name}.js`, STO_DATA);

    for (const oneAlias of aliases) {
      await activatePlugin(name, oneAlias);
    }
  }

  sendEvent(EVT_PluginsLoadingFinished);

  if (!srcJSOverride)
    srcJSOverride = await _Storage.search(STO_DATA, FILENAME_JSBACKEND);
  
  appendJavaScript(FILENAME_JSBACKEND, srcJSOverride, document.head);

  if (srcMainCSSPlus)
    appendCSS('mainCSSPlus', srcMainCSSPlus);

  if (srcJSOverridePlus)
    appendJavaScript('mainJSPlus', srcJSOverridePlus, document.head);
}

async function loadPlugin(name, file, source = STO_DATA) {
  const appendingAlias = name.replaceAll('/', '_');
  log(`Plugins: loading from file '${file}' under internal alias ${appendingAlias} ...'`);
  const srcMarkedJs = await _Storage.search(source, file);
  appendJavaScript(`plugins-${appendingAlias}.js`, srcMarkedJs, document.head);
}

async function activatePlugin(name, alias, source = STO_DATA) {
  const pluginPureName = name.split('/').pop();
  const cfgFile = `plugins-config/${name}_${alias}.cfg`;
  log(`Plugins: loading configuration for plugin ${pluginPureName} (${name}) from file '${cfgFile} ...'`);
  const configFileRaw = await _Storage.search(source, cfgFile);
  const configFileStruct = parseConfigFile(configFileRaw || '|');
  Plugins.activate(pluginPureName, alias, configFileStruct || {});
}

function parseConfigFile(data) {
  var rows = rowsToArray(data.trim());
  const obj = rows
    .reduce((acc, line) => {
      const [key, value] = line.split('|');
      acc[key] = value;
      return acc;
    }, {});
  return obj;
}
