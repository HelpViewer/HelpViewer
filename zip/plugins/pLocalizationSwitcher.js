class LocLoad extends IEvent {
  constructor() {
    super();
    this.name = '';
  }
}

class LocTranslate extends IEvent {
  constructor() {
    super();
    this.name = '';
    this.strings = {};
  }
}

class LocRefresh extends IEvent {
  constructor() {
    super();
    this.strings = {};
  }
}

class LocGetLanguages extends IEvent {
  constructor() {
    super();
    this.additional = [];
  }
}

class LocAppend extends IEvent {
  constructor() {
    super();
    this.strings = {};
  }
}
class pLocalizationSwitcher extends IPlugin {
  static EVT_LOC_TRANSLATE = LocTranslate.name;
  static EVT_LOC_GET_ACTIVE_LANGUAGE = 'GET_ACTIVE_LANGUAGE';
  static EVT_LOC_LANGUAGES = LocGetLanguages.name;
  static EVT_LOC_LOAD = LocLoad.name;
  static EVT_LOC_LOADED = 'LOC_LOADED';
  static EVT_LOC_REFRESH = LocRefresh.name;
  static EVT_LOC_APPEND = LocAppend.name;

  constructor(aliasName, data) {
    super(aliasName, data);

    this.langStrs = undefined;
    this.langKeysDyn = undefined;

    this.DEFAULT_KEY_CFG_STOREKEY = 'language';
    this.DEFAULT_KEY_CFG_DEFAULTLANG = 'en';
  }

  init() {
    const T = this.constructor;
    const TI = this;

    TI.activeLanguage = getUserConfigValue(TI.cfgSTOREKEY) || TI.cfgDEFAULTLANG;

    const h_EVT_LOC_TRANSLATE = (data) => {
      data.result = this._T(data.name, data.strings);
    };
    TI.eventDefinitions.push([T.EVT_LOC_TRANSLATE, LocTranslate, h_EVT_LOC_TRANSLATE]);

    const h_EVT_LOC_GET_ACTIVE_LANGUAGE = (data) => {
      data.result = TI.activeLanguage;
    };
    TI.eventDefinitions.push([T.EVT_LOC_GET_ACTIVE_LANGUAGE, IEvent, h_EVT_LOC_GET_ACTIVE_LANGUAGE]);

    const h_EVT_LOC_LANGUAGES = (data) => {
      data.result = this.getLanguagesList(data.additional);
    };
    TI.eventDefinitions.push([T.EVT_LOC_LANGUAGES, LocGetLanguages, h_EVT_LOC_LANGUAGES]);

    const h_EVT_LOC_LOAD = (data) => {
      this.loadLocalization(data.name, data.eventId);
    };
    TI.eventDefinitions.push([T.EVT_LOC_LOAD, LocLoad, h_EVT_LOC_LOAD]);

    const h_EVT_LOC_REFRESH = (data) => {
      this.refreshTitlesForLangStrings(null, data.strings);
    };
    TI.eventDefinitions.push([T.EVT_LOC_REFRESH, LocRefresh, h_EVT_LOC_REFRESH]);

    TI.eventDefinitions.push([T.EVT_LOC_LOADED, LocLoad, null]); // outside event handlers

    const h_EVT_LOC_APPEND = (data) => {
      const keys = this._processFlatStrings(data.strings.split('\n'));
      this.refreshTitlesForLangStrings(Object.keys(keys), undefined);
    };
    TI.eventDefinitions.push([T.EVT_LOC_APPEND, LocAppend, h_EVT_LOC_APPEND]);

    TI.catalogizeEventCall(TI.init, EventNames.UserConfigGet);
    TI.catalogizeEventCall(h_EVT_LOC_LOAD, T.EVT_LOC_LOAD);

    super.init();
  }
  
  static langFileAlias = 'lname.txt';
  static langFileJS = 'lstr.js';
  static langFileTXT = 'lstr.txt';
  static languagesMainPath = 'lang/';
  
  async _storageSearch(filePath, format = STOF_TEXT) {
    return storageSearch(STO_DATA, filePath, format);
  }

  async getLanguagesList(additional)
  {
    const T = this.constructor;
    var langNames = [];
    const langs = await storageGetSubdirs(STO_DATA, T.languagesMainPath);

    if (additional && Array.isArray(additional))
      langs.push(...additional);

    for (const val of langs) {
      const alias = await this._storageSearch(`${T.languagesMainPath}${val}/${T.langFileAlias}`) || val;
      langNames.push(`${alias}|${val}`);
    };

    langNames = [...new Set(langNames)].filter((x) => x && x != '|');

    return langNames;
  }
  
  //lstr.js format: var _lstr must be implemented by files
  //lstr.txt format - one row = one key: key|value(|continuous value allowed)
  //lstr.* must be defined in codepage UTF-8 no BOM (65001)
  async loadLocalization(localizationName, parentEventId)
  {
    const T = this.constructor;
    const TI = this;

    this.langStrs = {};
  
    const langJS = await this._storageSearch(`${T.languagesMainPath}${localizationName}/${T.langFileJS}`);
    const jsKey = 'langDynStrings';
    $(jsKey)?.remove();
    appendJavaScript(jsKey, langJS, document.head);

    const langFlatStrs = (await this._storageSearch(`${T.languagesMainPath}${localizationName}/${T.langFileTXT}`)).split("\n");
    
    if (!langFlatStrs || langFlatStrs.length == 0  || langFlatStrs == '') {
      loadLocalization(TI.cfgDEFAULTLANG);
      return;
    }

    this._processFlatStrings(langFlatStrs);
    
    if (typeof _lstr !== "undefined") {
      this.langKeysDyn = Object.keys(_lstr);
      Object.assign(this.langStrs, _lstr);
    }

    this.refreshTitlesForLangStrings(Object.keys(this.langStrs));
    TI.activeLanguage = localizationName;
    setUserConfigValue(TI.cfgSTOREKEY, localizationName);
    
    sendEvent(T.EVT_LOC_LOADED, (x) => {
      x.name = localizationName;
      x.parentEventId = parentEventId;
    });
  }
  
  refreshTitlesForLangStrings(strings, spars) {
    strings = strings || this.langKeysDyn;
    if (!strings) return;

    var sparsI = spars
    if (!sparsI)
      sparsI = {};
    
    strings.forEach(key => {
      const val = this.langStrs[key]?.(sparsI);
      var foundO = $(key);
      
      if (foundO) {
        foundO.title = val;
        foundO.ariaLabel = val;
      } else {
        const splits = key.split('__');
        
        if (splits.length > 1) {
          foundO = $(splits[0]);
          
          if (foundO) {
            if (splits[1] in foundO)
              foundO[splits[1]] = val;
            else
              foundO.setAttribute(splits[1], val);
          }
        }
      }
    });
  }

  _processFlatStrings(langFlatStrs) {
    const keys = {};

    for (var i = 0; i < langFlatStrs.length; i++) {
      const line = langFlatStrs[i];
      const trimmed = line.trim();
      const parts = trimmed.split("|", 2);
      const key = parts[0]?.trim() || "";
      const val = parts[1]?.trim() || "";
      this.langStrs[key] = (s) => val;
      keys[key] = val;
    }

    return keys;
  }
  
  _T(key, strings) {
    if (!key) return "";
    
    if (typeof this.langStrs?.[key] === 'function') {
      const val = this.langStrs[key](strings) || `_${key}_`;
      return val;
    } else {
      return `_${key}_`;
    }
  }
}
  
Plugins.catalogize(pLocalizationSwitcher);
