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

    var internalResources = false;
    if (r.uri?.startsWith(":_")) {
      processIt = true;
      internalResources = DEBUG_MODE;

      if (DEBUG_MODE) {
        r.contentType = ChapterContentType.INTERNAL_RESOURCE;
        r.getStorageData = r.getAppData;
        log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to ${STO_DATA}.`);

        r.uri = r.uri.substring(2);
        // static file content
        if (r.uri.startsWith('/')) {
          r.uri = `:i/__/${r.uri.substring(1)}`;
          internalResources = false;
        }
      } else {
        log('E DEBUG_MODE is inactive, access to this type of resource is restricted for production environment!');
      }
    }

    if (r.uri?.startsWith(":") && !internalResources) {
      internalResources = true;
      r.contentType = ChapterContentType.INTERNAL_RESOURCE;
      r.getStorageData = r.getAppData;
      log(`Resolution: ${r.eventId};${r.uri} ... main storage set from ${STO_HELP} to ${STO_DATA}.`);
      r.uri = r.uri.substring(1);
      if (!/\.(md|htm|html)$/i.test(r.uri) || (!DEBUG_MODE && r.uri.startsWith('i/'))) {
        log(`Resolution: ${r.eventId};${r.uri} ... insecured address for internal data. Stopping operation.`);
        processIt = false;
        r.tokens.push(r.TOKEN_NOLOADDATA);
      }
      processIt = true;
    }

    if (resolveFileMedium(r.helpFile) == UserDataFileLoadedFileType.NETWORK && r.helpFile.endsWith('/')) {
      r.contentType = ChapterContentType.NETWORK_RESOURCE;
      r.getStorageData = r.STORAGE_NETW;
      log(`Resolution: ${r.eventId};${r.uri} ... help file ${r.helpFile} is network located ... main storage set from ${STO_HELP} to STORAGE_NETWORK.`);
      processIt = true;
    }

    if (r.uri?.startsWith("~")) {
      r.contentType = ChapterContentType.NETWORK_RESOURCE;
      r.getStorageData = r.STORAGE_NETW;
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
