class puiButtonEditRepo extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'editRepoBtn';
    this.DEFAULT_KEY_CFG_CAPTION = '📝';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_HEADER;
  }

  init() {
    const T = this.constructor;
    const TI = this;
 
    super.init();

    hideButton(TI.button.id, false);
    TI.button.classList.add(C_HIDDENCPRESMODE);

    TI.catalogizeEventCall(TI._buttonAction, EventNames.ConfigFileGet);
    TI.catalogizeEventCall(TI._buttonAction, EventNames.GetHomePageData);
    TI.catalogizeEventCall(TI._buttonAction, EventNames.GET_ACTIVE_LANGUAGE);
    TI.catalogizeEventCall(TI._buttonAction, EventNames.GetsGet);
    
    TI.catalogizeEventCall(TI.onETChapterShown, EventNames.ElementSetVisibility);
  }
  
  _buttonAction(evt) {
    const PRJNAME_VAL = configGetDataProjectFile().split('/');
    const fileLink = getHelpRepoUriEditFile(PRJNAME_VAL[0], PRJNAME_VAL[1], (getGets(PAR_NAME_PAGE) || getHomePageData())?.split(MARKER_MARKWORD)[0], getActiveLanguage(), 'main');
    window.location.href = fileLink;
  }

  onETChapterShown(evt) {
    hideButton(this.button.id, evt.contentType == ChapterContentType.CHAPTER_SOURCE);
  }
}

Plugins.catalogize(puiButtonEditRepo);
