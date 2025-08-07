class ShowChapterResolutions extends IEvent {
  constructor() {
    super();
    this.heading = undefined;
    this.content = undefined;
    this.uri = undefined;
    this.uriAnchor = undefined;
    this.addData = new Map();
    this.storage = undefined;
    this.containerIdTitle = undefined;
    this.containerIdContent = undefined;
  }
}

class ShowChapter extends IEvent {
  constructor() {
    super();
    this.event = undefined;
    this.heading = undefined;
    this.address = undefined;
    this.sourceObject = undefined;
    this.result = undefined;
    this.containerIdTitle = undefined;
    this.containerIdContent = undefined;
  }
}

class pTopicRenderer extends IPlugin {
  static EVT_TOPREN_SHOW_CHAPTER = ShowChapter.name;

  static KEY_CFG_ID_CONTENT = 'IDCONTENT';
  static KEY_CFG_ID_TITLE = 'IDTITLE';

  static MARKER_ADDDATA = '@@';
  static MARKER_ADDDATA_SPLITTER = ';';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID_CONTENT = 'content';
    this.DEFAULT_KEY_CFG_ID_TITLE = 'mtitle';
  }
  
  init() {
    const T = this.constructor;
    const TI = this;
    
    this.cfgIdContent = this.config[T.KEY_CFG_ID_CONTENT] || TI.DEFAULT_KEY_CFG_ID_CONTENT;
    this.cfgIdTitle = this.config[T.KEY_CFG_ID_TITLE] || TI.DEFAULT_KEY_CFG_ID_TITLE;
    //if (/^(https?|ftp):\/\//i.test(ed.fileName))

    const h_EVT_TOPREN_SHOW_CHAPTER = (data) => {
      data.result = new ShowChapterResolutions();
      const r = data.result;
      r.heading = getChapterAlternativeHeading(data.uri) || data.heading;
      r.containerIdTitle = data.containerIdTitle || this.cfgIdTitle;
      r.containerIdContent = data.containerIdContent || this.cfgIdContent;

      // r.content = undefined;
      // r.uri = undefined;
      // r.uriAnchor = undefined;
      // r.addData = new Map();
      // r.storage = undefined;
  
      console.warn('!!!', data);
    };
    TI.eventDefinitions.push([T.EVT_TOPREN_SHOW_CHAPTER, StorageGet, h_EVT_TOPREN_SHOW_CHAPTER]);

    
    super.init();
  }
  
  deInit() {
    super.deInit();
  }

}

Plugins.catalogize(pTopicRenderer);
