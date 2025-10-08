const CFG_KEY_OverrideSidebarVisible = 'OverrideSidebarVisible';
const CFG_KEY_OverrideColorTheme = 'OverrideColorTheme';
const CFG_KEY_OverrideBookIconOpened = 'OverrideBookIcon-opened';
const CFG_KEY_OverrideBookIconClosed = 'OverrideBookIcon-closed';
const CFG_KEY_OverrideBookIconSibling = 'OverrideBookIcon-sibling';
const CFG_KEY_OverridePrintKeepIcons = 'OverridePrintKeepIcons';
const CFG_KEY_HOME = 'HOME';
const CFG_KEY_Languages = '_langs';

const FILE_CONFIG_DEFAULT = 'FILE_CONFIG_DEFAULT';
const FILE_CONFIG = 'FILE_CONFIG';

function configGetValue(key, backup, CFG = FILE_CONFIG) {
  return sendEvent(EventNames.ConfigFileGet, (x) => {
    x.key = key;
    x.backup = backup;
    x.id = CFG;
  }) || backup;
}

function configGetDataProjectFile() {
  var prjName = configGetValue(CFG_KEY__PRJNAME, '', FILE_CONFIG);
  if (prjName)
    return prjName;

  const baseURI = 'https://';
  if (!prjName && dataPathGeneral.startsWith(baseURI))
    prjName = dataPathGeneral.substring(baseURI.length).split('/')?.slice(1, 3).join('/');

  return prjName;
}

function configFileReload(CFG = FILE_CONFIG) {
  return sendEventWProm(EventNames.ConfigFileReload, (x) => {
    x.id = CFG;
  });
}
