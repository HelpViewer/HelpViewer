class pKWHTMLToText extends pTRPhasePlugin {
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
    r.result = r.result.then((x) => r.content = stripTags(r.content, true));
  }
}

Plugins.catalogize(pKWHTMLToText);
