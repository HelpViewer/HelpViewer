class ShowChapterResolutions extends IEvent {
  constructor() {
    super();
    this.heading = undefined;
    this.content = undefined;
    this.uri = undefined;
    this.fileType = undefined;
    this.fileMedium = undefined;
    this.uriAnchor = undefined;
    this.addData = new Map();
    /** @type {(fileName : string) => string} */
    this.getStorageData = undefined;
    /** @type {(txt : string) => void} */
    this.setTitle = (txt) => SetHeaderText(txt);
    this.containerContent = undefined;
    /** @type {() => void} */
    this.preventDefault = undefined;
    //this.parentEvent = undefined;
    this.stopAllPhases = false;
  }
}

class ShowChapter extends IEvent {
  constructor() {
    super();
    this.event = undefined;
    this.heading = undefined;
    this.address = undefined;
    this.sourceObject = undefined;
    this.result = new ShowChapterResolutions();
    this.result.parentEventId = this.eventId;
    //this.result.parentEvent = this;
    this.result.preventDefault = () => this.event?.preventDefault?.();
    this.containerIdContent = undefined;
  }
}

class pTopicRenderer extends IPlugin {
  static EVT_TOPREN_SHOW_CHAPTER = ShowChapter.name;
  static EVT_TOPREN_SHOW_CHAPTER_RES = ShowChapterResolutions.name;

  static KEY_CFG_ID_CONTENT = 'IDCONTENT';
  static KEY_CFG_PHASELIST = 'PHASELIST';

  static MARKER_ADDDATA = '@@';
  static MARKER_ADDDATA_SPLITTER = ';';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID_CONTENT = 'content';
    this.DEFAULT_KEY_CFG_PHASELIST = 'triage;unconnected;connected;%%;decorators';
    this.eventIdStrict = true;
  }
  
  init() {
    const T = this.constructor;
    const TI = this;
    
    this.cfgIdContent = this.config[T.KEY_CFG_ID_CONTENT] || TI.DEFAULT_KEY_CFG_ID_CONTENT;
    this.cfgPhaseList = this.config[T.KEY_CFG_PHASELIST] || TI.DEFAULT_KEY_CFG_PHASELIST;

    const h_EVT_TOPREN_SHOW_CHAPTER = (data) => {
      const r = data.result;

      if (DEBUG_MODE_RENDERER) {
        log('W DEBUG_MODE_RENDERER flag is active, all steps will work to all phases event it should be redirected outside the instance!');
        r.preventDefault();
      }

      r.heading = getChapterAlternativeHeading(data.address)[1] || data.heading;
      const containerIdContent = data.containerIdContent || this.cfgIdContent;
      r.containerContent = $(containerIdContent);
      r.uri = typeof data.address === 'string' ? data.address.split(T.MARKER_ADDDATA) : [];
      r.uri.push('');
      
      const splits = r.uri[1].split(T.MARKER_ADDDATA_SPLITTER);

      for (let i = 0; i < splits.length - 1; i += 2)
        r.addData.set(splits[i], splits[i + 1]);

      r.uri = r.uri[0];
      r.uriAnchor = r.uri.split('#');
      r.uri = r.uriAnchor[0];

      if (r.uriAnchor && r.uriAnchor.length > 1)
        r.uriAnchor = `#${r.uriAnchor[1]}`;
      else 
        r.uriAnchor = undefined;

      r.type = r.uri ? r.uri.split('/').pop().split('.') : undefined;

      if (r.type && r.type.length > 1)
        r.type = r.type[1];
      else
        r.type = undefined;

      r.fileMedium = resolveFileMedium(r.uri);

      const subIds = this.cfgPhaseList.replace('%%', r.type?.substring(0, 3)).split(';');
      subIds.forEach((phase) => {
        log(`Rendering ${r.uri} phase ${phase} ... sending to plugins with id '${this.aliasName}-${phase}'`);
        sendEventObject(r, `${this.aliasName}-${phase}`);
        if (!r.stopAllPhases)
          r.stop = false;
      });

      // r.containerContent = undefined;
      // r.getStorageData = undefined;  
    };
    TI.eventDefinitions.push([T.EVT_TOPREN_SHOW_CHAPTER, ShowChapter, h_EVT_TOPREN_SHOW_CHAPTER]);
    TI.eventDefinitions.push([T.EVT_TOPREN_SHOW_CHAPTER_RES, ShowChapterResolutions, null]); // outside event handlers

    super.init();
  }
  
  deInit() {
    super.deInit();
  }

}

Plugins.catalogize(pTopicRenderer);

class pTRPhasePlugin extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;
  }

  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }
}

function SetHeaderText(txt) {
  setHeader(txt);
  document.title = txt.replace(/<[^>]+>/g, '');
}
