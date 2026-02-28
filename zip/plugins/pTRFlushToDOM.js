class pTRFlushToDOM extends pTRPhasePlugin {
  init() {
    super.init();

    const TI = this;
    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.StorageGetImages);

    TI.replacements = {
      'LANG': (r) => getActiveLanguage().toLowerCase(),
      'LTOPVERSIONV': (r) => linkVer2.innerHTML,
      'LTOPVERSIONN': (r) => linkVer1.innerHTML,
    };

    TI.linksPrepared = false;
  }

  onET_ConfigFileReloadFinished(d) {
    insertDownloadLink(linkVer1);
    insertDownloadLink(linkVer2, '@ (_)');
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

    if (!this.linksPrepared) {
      this.onET_ConfigFileReloadFinished(undefined);
      this.linksPrepared = true;
    }

    function safeLinkHtml(el) {
      if (!el) return;
      const ah = $O('a[href]', el);
      const minLink = linkToSecuredLink(ah);
      el.innerHTML = minLink?.outerHTML || '';
    }

    safeLinkHtml(linkVer2);
    safeLinkHtml(linkVer1);

    let replacements = Object.fromEntries(
      Object.entries(this.replacements).map(([key, fn]) => {
        return [key, fn(r)];
      })
    );
    r.content = multipleTextReplace(r.content, replacements, '@');
    r.docV.innerHTML = (window.DOMPurify && r.contentType != ChapterContentType.INTERNAL_RESOURCE) ? DOMPurify.sanitize(r.content) : r.content;
    //r.docV.innerHTML = r.content;
    r.fixRelativePathToZipPaths(r.docV);
    r.doc = r.docV;
  }
}

Plugins.catalogize(pTRFlushToDOM);

function linkToSecuredLink(ah) {
  if (ah) {
    const newA = document.createElement('a');
    const hrefURI = ah.getAttribute('href');
    if (!/^https?:|ftp:\/\//.test(hrefURI)) {
      el.innerHTML = '';
      return;
    }
    newA.setAttribute('href', hrefURI || '');
    newA.setAttribute('title', ah.getAttribute('title') || '');
    newA.innerText = ah.innerText || '';
    return newA;
  }
  return;
}
