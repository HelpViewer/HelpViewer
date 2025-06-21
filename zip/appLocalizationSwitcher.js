/*S: Feature: Language switching management */
const langFileAlias = 'lname.txt';
const langFileJS = 'lstr.js';
const langFileTXT = 'lstr.txt';
const languagesMainPath = 'lang/';

var langStrs;
var langKeysDyn;

const KEY_LS_LANG = "language";
const DEFAULT_LANG = 'en';
const activeLanguage = localStorage.getItem(KEY_LS_LANG) || DEFAULT_LANG;
// setLanguage must be called in UI (appmainNext.js) 

function setLanguage(val) {
  loadLocalization(val);
  localStorage.setItem(KEY_LS_LANG, val);
}

async function getLanguagesList()
{
  var langNames = [];
  const langs = await _Storage.getSubdirs(STO_DATA, languagesMainPath);
  
  langs.forEach(async (val, idx) => {
    const alias = await _Storage.search(STO_DATA, `${languagesMainPath}${val}/${langFileAlias}`) || val;
    langNames.push(`${alias}|${val}`);
  });
  
  return langNames;
}

//lstr.js format: var _lstr must be implemented by files
//lstr.txt format - one row = one key: key|value(|continuous value allowed)
//lstr.* must be defined in codepage UTF-8 no BOM (65001)
async function loadLocalization(localizationName)
{
  langStrs = {};

  const langJS = await _Storage.search(STO_DATA, `${languagesMainPath}${localizationName}/${langFileJS}`);
  appendJavaScript('langDynStrings', langJS, document.head);

  const langFlatStrs = (await _Storage.search(STO_DATA, `${languagesMainPath}${localizationName}/${langFileTXT}`)).split("\n");
  
  for (var i = 0; i < langFlatStrs.length; i++) {
    const line = langFlatStrs[i];
    const trimmed = line.trim();
    const parts = trimmed.split("|", 2);
    const key = parts[0]?.trim() || "";
    const val = parts[1]?.trim() || "";
    langStrs[key] = () => val;
  }
  
  if (typeof _lstr !== "undefined") {
    langKeysDyn = Object.keys(_lstr);
    Object.assign(langStrs, _lstr);
  }
  
  refreshTitlesForLangStrings(Object.keys(langStrs));
  
  FILENAME_DEFAULT_HELPFILE = `hlp/Help-${localizationName}.zip`;
}

function refreshTitlesForLangStrings(strings) {
  strings = strings || langKeysDyn;
  if (!strings) return;
  
  strings.forEach(key => {
    const val = langStrs[key]();
    var foundO = document.getElementById(key);
    
    if (foundO) {
      foundO.title = val;
      foundO.ariaLabel = val;
    } else {
      const splits = key.split('__');
      
      if (splits.length > 1) {
        foundO = document.getElementById(splits[0]);
        
        if (foundO) {
          foundO.setAttribute(splits[1], val);
        }
      }
    }
  });
}

function _T(key) {
  if (!key) return "";
  
  if (typeof langStrs?.[key] === 'function') {
    const val = langStrs[key]() || `_${key}_`;
    return val;
  } else {
    return `_${key}_`;
  }
}

/*E: Feature: Language switching management */