class pTRTriage extends pTRPhasePlugin {
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
    if (r.fileMedium === UserDataFileLoadedFileType.NETWORK) {
      log(`Resolution: ${r.uri} ... is external resource link.`);
      return;
    }

    const uriRelative = new URL(r.uri).search;

    if (uriRelative && uriRelative.startsWith(`?${PAR_NAME_DOC}=`)) {
      log(`Resolution: ${r.uri} ... is external help file.`);
      return;
    }

    r.preventDefault();
  }
}

Plugins.catalogize(pTRTriage);
