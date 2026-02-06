class pTRParseMd extends pTRPhasePlugin {
  static EVT_MARKEDEXTEND = 'MarkedExtend';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_FILENAME = 'marked.min.js;LICENSE-marked.md';
  }

  init() {
    const T = this.constructor;
    const TI = this;

    TI.eventDefinitions.push([T.EVT_MARKEDEXTEND, IEvent, null]); // outside event handlers
    TI.catalogizeEventCall('onETShowChapterResolutions', T.EVT_MARKEDEXTEND);
    super.init();

    TI.RES_MARKED = new Resource('MARKED', undefined, STO_DATA, TI.cfgFILENAME);
  }
  
  onETShowChapterResolutions(r) {
    if (!window.marked) {
      const T = this.constructor;
      const TI = this;
  
      r.result = TI.RES_MARKED?.init(r.result);
      r.result = r.result.then(() => sendEvent(T.EVT_MARKEDEXTEND));
    }

    r.result = (!r.content || r.content.length == 0) ? r.result : r.result.then(() => r.content = marked.parse(r.content));
  }
}

Plugins.catalogize(pTRParseMd);
