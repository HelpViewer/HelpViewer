class pTRLoadData extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    const TI = this;

    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.GET_ACTIVE_LANGUAGE);
    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.StorageGet);

    super.init();
  }

  deInit() {
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    var shouldLoad = true;

    r.onTokenDo(r.TOKEN_NOLOADDATA, () => {
      shouldLoad = false;
    });

    if (shouldLoad) {
      r.contentType = r.contentType || ChapterContentType.CHAPTER_SOURCE;

      const newUri = r.uri.replace('__', getActiveLanguage());
      log(`Resolution: ${r.eventId};${r.uri} -> ${newUri}.`);
      r.uri = newUri;

      r.result = r.getStorageData(r.uri).then((x) => {
        r.content = x;
      });
    }

  }
}

Plugins.catalogize(pTRLoadData);
