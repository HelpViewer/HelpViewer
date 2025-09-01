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
    r.result = r.result.then((x) => r.content[0] = stripTags(r.content[0], true));
  }
}

Plugins.catalogize(pKWHTMLToText);
