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
    setPanelsEmpty();

    if (r.fileMedium === UserDataFileLoadedFileType.NETWORK) {
      log(`Resolution: ${r.eventId};${r.uri} ... is external resource link.`);
      return this.doneVal;
    }

    var uriRelative;

    try {
      uriRelative = new URL(r.uri).search;
    } catch (error) {
      uriRelative = r.uri;
    }

    if (uriRelative && uriRelative.startsWith(`?${PAR_NAME_DOC}=`)) {
      log(`Resolution: ${r.eventId};${r.uri} ... is external help file.`);
      return this.doneVal;
    }

    var processIt = false;

    if (r.uri?.startsWith(":")) {
      r.getStorageData = r.getAppData;
      log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to ${STO_DATA}.`);
      r.uri = r.uri.substring(1);
      processIt = true;
    }

    if (r.uri?.startsWith("~")) {
      r.getStorageData = pTopicRenderer.STORAGE_NETW;
      log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to STORAGE_NETWORK.`);
      r.uri = r.uri.substring(1);
      processIt = true;
    }

    r.preventDefault();
    //r.setTitle(r.heading);

    if (!processIt)
      return this.doneVal;

    r.result = r.getStorageData(r.uri).then((x) => {
      r.content = x;
    });

    r.stop = true;
  }
}

Plugins.catalogize(pTRTriage);
