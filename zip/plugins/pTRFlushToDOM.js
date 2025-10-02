class pTRFlushToDOM extends pTRPhasePlugin {
  init() {
    super.init();

    const TI = this;
    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.StorageGetImages);
  }
  
  onETShowChapterResolutions(r) {
    log(`Rendering ${r.uri} data attached to DOM - visible to user now`);
    r.fixRelativePathToZipPaths(r.heading, ":not(.treepic)");

    if (!r.targetOverriden) {
      r.heading = r.heading.split(MARKER_MARKWORD)[0];
      r.setTitle(r.heading);
    }
  
    if (r.docM)
      r.content = r.docM.body.innerHTML;
    
    const notFound = (r.content?.length == 0 && r.content?.size == 0);

    if (notFound) {
      if (!r.tokens.includes(r.TOKEN_NONOTFOUNDMSG))
        r.content = _T('MSG_PATH_NOT_FOUND_IN_ARCH');
    }

    r.found = !notFound;

    if (r.fileMedium == UserDataFileLoadedFileType.NETWORK)
      r.content = '';

    r.docV.innerHTML = r.content;
    r.fixRelativePathToZipPaths(r.docV);
    r.doc = r.docV;
  }
}

Plugins.catalogize(pTRFlushToDOM);
