class pTRLoadData extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
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
      r.result = r.getStorageData(r.uri).then((x) => {
        r.content = x;
      });
    }

  }
}

Plugins.catalogize(pTRLoadData);
