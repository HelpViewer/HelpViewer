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
    r.setTitle(r.heading);

    if (r.fileMedium === UserDataFileLoadedFileType.NETWORK) {
      log(`Resolution: ${r.eventId};${r.uri} ... is external resource link.`);
      return;
    }

    var uriRelative;

    try {
      uriRelative = new URL(r.uri).search;
    } catch (error) {
      uriRelative = r.uri;
    }

    if (uriRelative && uriRelative.startsWith(`?${PAR_NAME_DOC}=`)) {
      log(`Resolution: ${r.eventId};${r.uri} ... is external help file.`);
      return;
    }

    if (r.uri?.startsWith(":")) {
      r.getStorageData = r.getAppData;
      log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to ${STO_DATA}.`);
      r.uri = r.uri.substring(1);
    }

    if (r.uri?.startsWith("~")) {
      r.getStorageData = pTopicRenderer.STORAGE_NETW;
      log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to STORAGE_NETWORK.`);
      r.uri = r.uri.substring(1);
      r.getStorageData(r.uri).then((x) => {
        r.containerContent.innerHTML = x;
      });
    }

    r.preventDefault();
  }
}

Plugins.catalogize(pTRTriage);
