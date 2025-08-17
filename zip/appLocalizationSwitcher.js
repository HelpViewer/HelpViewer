/*S: Feature: Language switching management */
const DEFAULT_LANG = 'en';
const KEY_LS_LANG = "language";

function _T(key, strings = {}) {
  return sendEvent(EventNames.LocTranslate, (d) => {
    d.name = key;
    d.strings = strings;
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

function refreshTitlesForLangStrings(strings = {}) {
  sendEvent('LOC_REFRESH', (d) => {
    d.strings = strings;
  });
}
/*E: Feature: Language switching management */