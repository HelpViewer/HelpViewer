/*S: Feature: Language switching management */
const DEFAULT_LANG = 'en';

function _T(key) {
  var data;
  sendEvent(EventNames.LocTranslate, (d) => {
    d.name = key;
    data = d;
  });
  return data.result;
}

function getActiveLanguage() {
  var data;
  sendEvent('GET_ACTIVE_LANGUAGE', (d) => {
    data = d;
  });
  return data.result;
}

function getLanguagesList(additionalList = null) {
  var data;
  sendEvent('GET_LANGUAGES', (d) => {
    d.additional = additionalList;
    data = d;
  });

  return data.result;
}

function loadLocalization(localizationName) {
  sendEvent('LOC_LOAD', (d) => {
    d.name = localizationName;
  });

  FILENAME_DEFAULT_HELPFILE = `hlp/Help-${localizationName}.zip`;
  localStorage.setItem(pLocalizationSwitcher.KEY_LS_LANG, localizationName);

  return Promise.resolve();
}

function refreshTitlesForLangStrings() {
  sendEvent('LOC_REFRESH');
}
/*E: Feature: Language switching management */