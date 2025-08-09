/*S: Feature: Language switching management */
const DEFAULT_LANG = 'en';
const KEY_LS_LANG = "language";

function _T(key) {
  return sendEvent(EventNames.LocTranslate, (d) => {
    d.name = key;
  });
}

function getActiveLanguage() {
  return sendEvent('GET_ACTIVE_LANGUAGE');
}

function getLanguagesList(additionalList = null) {
  return sendEvent(EventNames.LocGetLanguages, (d) => {
    d.additional = additionalList;
  });
}

function loadLocalization(localizationName) {
  sendEvent('LOC_LOAD', (d) => {
    d.name = localizationName;
  });

  return Promise.resolve();
}

function refreshTitlesForLangStrings() {
  sendEvent('LOC_REFRESH');
}
/*E: Feature: Language switching management */