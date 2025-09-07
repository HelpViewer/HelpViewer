class pTRLoadData extends pTRPhasePlugin {
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
