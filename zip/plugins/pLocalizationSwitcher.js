class LocTranslate extends IEvent {
  constructor() {
    super();
    this.name = undefined;
  }
}

class LocGetLanguages extends IEvent {
  constructor() {
    super();
    this.additional = [];
  }
}

class pLocalizationSwitcher extends IPlugin {
  static EVT_LOC_TRANSLATE = LocTranslate.name;
  static EVT_LOC_GET_ACTIVE_LANGUAGE = 'GET_ACTIVE_LANGUAGE';
  static EVT_LOC_LANGUAGES = 'GET_LANGUAGES';
  static EVT_LOC_LOAD = 'LOC_LOAD';
  static EVT_LOC_LOADED = 'LOC_LOADED';
  static EVT_LOC_REFRESH = 'LOC_REFRESH';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.langStrs = undefined;
    this.langKeysDyn = undefined;
  }

  static eventDefinitions = [];
  
  init() {
    const h_EVT_LOC_TRANSLATE = (data) => {
      data.result = this._T(data.name);
    };
    pLocalizationSwitcher.eventDefinitions.push([pLocalizationSwitcher.EVT_LOC_TRANSLATE, LocTranslate, h_EVT_LOC_TRANSLATE]);

    const h_EVT_LOC_GET_ACTIVE_LANGUAGE = (data) => {
      data.result = pLocalizationSwitcher.activeLanguage;
    };
    pLocalizationSwitcher.eventDefinitions.push([pLocalizationSwitcher.EVT_LOC_GET_ACTIVE_LANGUAGE, IEvent, h_EVT_LOC_GET_ACTIVE_LANGUAGE]);

    const h_EVT_LOC_LANGUAGES = (data) => {
      data.result = this.getLanguagesList(data.additional);
    };
    pLocalizationSwitcher.eventDefinitions.push([pLocalizationSwitcher.EVT_LOC_LANGUAGES, LocGetLanguages, h_EVT_LOC_LANGUAGES]);

    const h_EVT_LOC_LOAD = (data) => {
      this.loadLocalization(data.name, data.eventId);
    };
    pLocalizationSwitcher.eventDefinitions.push([pLocalizationSwitcher.EVT_LOC_LOAD, LocTranslate, h_EVT_LOC_LOAD]);

    const h_EVT_LOC_REFRESH = (data) => {
      this.refreshTitlesForLangStrings(null);
    };
    pLocalizationSwitcher.eventDefinitions.push([pLocalizationSwitcher.EVT_LOC_REFRESH, IEvent, h_EVT_LOC_REFRESH]);

    pLocalizationSwitcher.eventDefinitions.push([pLocalizationSwitcher.EVT_LOC_LOADED, LocTranslate, null]); // outside event handlers

    super.init();
  }
  
  deInit() {
    super.deInit();
  }

  static langFileAlias = 'lname.txt';
  static langFileJS = 'lstr.js';
  static langFileTXT = 'lstr.txt';
  static languagesMainPath = 'lang/';
  
  static activeLanguage = getUserConfigValue(KEY_LS_LANG) || DEFAULT_LANG;
  
  async _storageSearch(filePath, format = STOF_TEXT) {
    return storageSearch(STO_DATA, filePath, format);
  }

  async getLanguagesList(additional)
  {
    var langNames = [];
    const langs = await storageGetSubdirs(STO_DATA, pLocalizationSwitcher.languagesMainPath);

    if (additional && Array.isArray(additional))
      langs.push(...additional);

    for (const val of langs) {
      const alias = await this._storageSearch(`${pLocalizationSwitcher.languagesMainPath}${val}/${pLocalizationSwitcher.langFileAlias}`) || val;
      langNames.push(`${alias}|${val}`);
    };

    langNames = [...new Set(langNames)];

    return langNames;
  }
  
  //lstr.js format: var _lstr must be implemented by files
  //lstr.txt format - one row = one key: key|value(|continuous value allowed)
  //lstr.* must be defined in codepage UTF-8 no BOM (65001)
  async loadLocalization(localizationName, parentEventId)
  {
    this.langStrs = {};
  
    const langJS = await this._storageSearch(`${pLocalizationSwitcher.languagesMainPath}${localizationName}/${pLocalizationSwitcher.langFileJS}`);
    appendJavaScript('langDynStrings', langJS, document.head);

    const langFlatStrs = (await this._storageSearch(`${pLocalizationSwitcher.languagesMainPath}${localizationName}/${pLocalizationSwitcher.langFileTXT}`)).split("\n");
    
    for (var i = 0; i < langFlatStrs.length; i++) {
      const line = langFlatStrs[i];
      const trimmed = line.trim();
      const parts = trimmed.split("|", 2);
      const key = parts[0]?.trim() || "";
      const val = parts[1]?.trim() || "";
      this.langStrs[key] = () => val;
    }
    
    if (typeof _lstr !== "undefined") {
      this.langKeysDyn = Object.keys(_lstr);
      Object.assign(this.langStrs, _lstr);
    }

    this.refreshTitlesForLangStrings(Object.keys(this.langStrs));
    pLocalizationSwitcher.activeLanguage = localizationName;
    setUserConfigValue(KEY_LS_LANG, localizationName);
    
    sendEvent(pLocalizationSwitcher.EVT_LOC_LOADED, (x) => {
      x.name = localizationName;
      x.parentEventId = parentEventId;
    });
  }
  
  refreshTitlesForLangStrings(strings) {
    strings = strings || this.langKeysDyn;
    if (!strings) return;
    
    strings.forEach(key => {
      const val = this.langStrs[key]();
      var foundO = document.getElementById(key);
      
      if (foundO) {
        foundO.title = val;
        foundO.ariaLabel = val;
      } else {
        const splits = key.split('__');
        
        if (splits.length > 1) {
          foundO = document.getElementById(splits[0]);
          
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
  
  _T(key) {
    if (!key) return "";
    
    if (typeof this.langStrs?.[key] === 'function') {
      const val = this.langStrs[key]() || `_${key}_`;
      return val;
    } else {
      return `_${key}_`;
    }
  }
}
  
Plugins.catalogize(pLocalizationSwitcher);
