class pTRPurify extends pTRPhasePlugin {

  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_FILENAME = 'purify.min.js;LICENSE-DOMPurify.txt';
  }

  init() {
    const TI = this;

    super.init();

    TI.RES_DOMPURIFY = new Resource('DOMPURIFY', undefined, STO_DATA, TI.cfgFILENAME);
  }
  
  onETShowChapterResolutions(r) {
    if (!window.DOMPurify)
      r.result = r.result.then(() => this.RES_DOMPURIFY?.init(r.result));

    if (r.contentType != ChapterContentType.INTERNAL_RESOURCE)
      r.result = (!r.content || r.content.length == 0) ? r.result : r.result.then(() => r.content = DOMPurify.sanitize(r.content));
  }
}

Plugins.catalogize(pTRPurify);
