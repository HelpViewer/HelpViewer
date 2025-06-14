const CFG_KEY_OverrideSidebarVisible = 'OverrideSidebarVisible';
const CFG_KEY_OverrideColorTheme = 'OverrideColorTheme';
const CFG_KEY_OverrideBookIconOpened = 'OverrideBookIcon-opened';
const CFG_KEY_OverrideBookIconClosed = 'OverrideBookIcon-closed';

var FILE_CONFIG_DEFAULT = parseConfigFile(
`
#${CFG_KEY_OverrideSidebarVisible}|1
#${CFG_KEY_OverrideColorTheme}|inStandard
#${CFG_KEY_OverrideBookIconOpened}|&#128214;
#${CFG_KEY_OverrideBookIconClosed}|&#128216;
`
);

var FILE_CONFIG;

(async () => {
  var readConfig = (await _Storage.search(STO_DATA, FILENAME_CONFIG));
  
  if (readConfig)
    FILE_CONFIG_DEFAULT = parseConfigFile(readConfig);
})();

function configGetValue(key, backup, CFG = FILE_CONFIG) {
  return CFG?.[key] ?? backup ?? FILE_CONFIG_DEFAULT[key];
}

function parseConfigFile(data) {
  const obj = data
    .trim()
    .replace(/\r\n/g, "\n").split('\n')
    .reduce((acc, line) => {
      const [key, value] = line.split('|');
      acc[key] = value;
      return acc;
    }, {});
  return obj;
}