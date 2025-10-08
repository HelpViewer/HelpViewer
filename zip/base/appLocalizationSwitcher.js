/*S: Feature: Language switching management */
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
  sendEvent(EventNames.LocLoad, (d) => {
    d.name = localizationName;
  });

  return Promise.resolve();
}

function refreshTitlesForLangStrings(strings = {}) {
  sendEvent(EventNames.LocRefresh, (d) => {
    d.strings = strings;
  });
}
/*E: Feature: Language switching management */