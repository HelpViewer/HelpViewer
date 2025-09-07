class pKWHTMLToText extends pTRPhasePlugin {
  onETShowChapterResolutions(r) {
    r.result = r.result.then((x) => r.content[0] = stripTags(r.content[0], true));
  }
}

Plugins.catalogize(pKWHTMLToText);
