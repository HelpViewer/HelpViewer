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

    const isNetwork = (r.fileMedium == UserDataFileLoadedFileType.NETWORK);// || resolveFileMedium(r.helpFile) == UserDataFileLoadedFileType.NETWORK;

    if (isNetwork) {
      log(`Resolution: ${r.eventId};${r.uri} ... is external resource link.`);
      return this.doneVal;
    }

    var uriRelative;

    try {
      uriRelative = new URL(r.uri).search;
    } catch (error) {
      r.preventDefault();
      if (!isNetwork)
        r.preventDefault();
      uriRelative = r.uri;
    }

    if (uriRelative && uriRelative.startsWith(`?${PAR_NAME_DOC}=`)) {
      log(`Resolution: ${r.eventId};${r.uri} ... is external help file.`);
      return this.doneVal;
    }

    var processIt = false;

    if (uriRelative && uriRelative.startsWith(`?${PAR_NAME_PAGE}=`)) {
      log(`Resolution: ${r.eventId};${r.uri} ... is this help file page.`);
      processIt = true;
    }

    if (r.uri?.startsWith(":")) {
      r.getStorageData = r.getAppData;
      log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to ${STO_DATA}.`);
      r.uri = r.uri.substring(1);
      if (!/\.(md|htm|html)$/i.test(r.uri)) {
        log(`Resolution: ${r.eventId};${r.uri} ... insecured address for internal data. Stopping operation.`);
        processIt = false;
        r.tokens.push(r.TOKEN_NOLOADDATA);
      }
      processIt = true;
    }

    if (r.uri?.startsWith("~")) {
      r.getStorageData = pTopicRenderer.STORAGE_NETW;
      log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to STORAGE_NETWORK.`);
      r.uri = r.uri.substring(1);
      processIt = true;
    }

    if (!processIt)
      return this.doneVal;

    r.preventDefault();
    r.stop = true;
  }
}

Plugins.catalogize(pTRTriage);
