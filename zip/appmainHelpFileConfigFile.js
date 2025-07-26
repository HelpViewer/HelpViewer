const CFG_KEY_OverrideSidebarVisible = 'OverrideSidebarVisible';
const CFG_KEY_OverrideColorTheme = 'OverrideColorTheme';
const CFG_KEY_OverrideBookIconOpened = 'OverrideBookIcon-opened';
const CFG_KEY_OverrideBookIconClosed = 'OverrideBookIcon-closed';
const CFG_KEY_OverridePrintKeepIcons = 'OverridePrintKeepIcons';
const CFG_KEY_Languages = '_langs';

const FILE_CONFIG_DEFAULT = 'FILE_CONFIG_DEFAULT';
const FILE_CONFIG = 'FILE_CONFIG';

function configGetValue(key, backup, CFG = FILE_CONFIG) {
  return sendEvent(EventNames.ConfigFileGet, (x) => {
    x.key = key;
    x.backup = backup;
    x.id = CFG;
  });
}

function configFileReload(CFG = FILE_CONFIG) {
  return sendEventWProm(EventNames.ConfigFileReload, (x) => {
    x.id = CFG;
  });
}
