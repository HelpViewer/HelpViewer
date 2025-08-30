class puiButtonEditRepo extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'editRepoBtn';
    this.DEFAULT_KEY_CFG_CAPTION = '✏️';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_HEADER;
  }

  init() {
    super.init();

    const T = this.constructor;
    const TI = this;
    hideButton(TI.button.id, false);
    TI.button.classList.add(C_HIDDENCPRESMODE);
  }

  deInit() {
    super.deInit();
  }

  _buttonAction(evt) {
    const PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME)?.trim().split('/');
    const fileLink = getHelpRepoUriEditFile(PRJNAME_VAL[0], PRJNAME_VAL[1], getGets(PAR_NAME_PAGE)?.split(MARKER_MARKWORD)[0], getActiveLanguage(), 'main');
    window.location.href = fileLink;
  }

  onET_ChapterShown(evt) {
    hideButton(this.button.id, evt.contentType == ChapterContentType.CHAPTER_SOURCE);
  }
}

Plugins.catalogize(puiButtonEditRepo);
