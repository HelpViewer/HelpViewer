const PAR_NAME_DOC = 'd'; // Help file path
const urlParams = new URLSearchParams(window.location.search);

dataPath = urlParams.get(PAR_NAME_DOC)?.replace('__', '');

if (typeof dataPath !== 'string' || dataPath.trim() === '') {
  dataPath = FILENAME_DEFAULT_HELPFILE;
}

if (dataPath) {
  (async () => {
    var archive = await _Storage.add(STO_HELP, dataPath);
    
    if (archive) {
      initLayout(STO_HELP);
      srcJSOverride = await _Storage.search(STO_HELP, FILENAME_JSBACKEND);
      
      if (!srcJSOverride)
        srcJSOverride = await _Storage.search(STO_DATA, FILENAME_JSBACKEND);

      srcMainCSSPlus = await _Storage.search(STO_HELP, FILENAME_MAINCSS_PLUS);
      srcJSOverridePlus = await _Storage.search(STO_HELP, FILENAME_JSBACKEND_PLUS);
    }
  })();
}