class puiButtonVersionSearch extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-ChangeVersion';
    this.DEFAULT_KEY_CFG_CAPTION = '🕘';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;
    this.FILENAME_CHANGELOG = 'CHANGELOG.md';
  }

  init() {
    super.init();
    hideButton(this.button.id, false);
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    const reply = showChapter(null, _T('versionList'), '~' + this.FILENAME_CHANGELOG, null, this.txt);
    hideButton(this.button.id, reply?.content?.length > 0)
    sendEvent('ShowBookmarks');
  }

  onET_ConfigFileReloadFinished(evt) {
    const PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME)?.trim().split('/');
    const pathVersions = getHelpRepoUri(PRJNAME_VAL[0], PRJNAME_VAL[1]) + this.FILENAME_CHANGELOG;
    this.txt = null;
    hideButton(this.button.id, false);
    try {
      fetchData(pathVersions)
        .then((x) => this.txt = toText(x))
        .then(() => hideButton(this.button.id, !!this.txt));
    } catch (error) {
      this.txt = null;
    }
  }

}

Plugins.catalogize(puiButtonVersionSearch);
