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
    /** @type {(fileName : string) => string} */
    this.getAppData = undefined;
    /** @type {(txt : string) => void} */
    this.setTitle = (txt) => SetHeaderText(txt);

    this.fixRelativePathToZipPaths = (doc, exclusion) => 
      {
        try {
          fixImgRelativePathToZipPaths(doc, STO_HELP, exclusion);
        } catch (e) {}
      };

    this.tokens = [];
    this.TOKEN_NOLOADDATA = 'TOKEN_NOLOADDATA';

    this.onTokenDo = (token, handler) => {
      const r = this;
      if (r.tokens.includes(token)) {
        r.tokens = r.tokens.filter(x => x != token);
        handler?.();
      }
    };

    this.doc = undefined;
    this.docV = undefined;
    this.docM = undefined;
    /** @type {() => void} */
    this.preventDefault = undefined;
    //this.parentEvent = undefined;
    this.stopAllPhases = false;
    this.helpFile = undefined;
    this.content = undefined;
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
    this.helpFile = undefined;
  }
}

class ChapterShown extends IEvent {
  constructor() {
    super();
    this.heading = undefined;
    this.content = undefined;
    this.address = undefined;
    this.addressOrig = undefined;
    this.sourceObject = undefined;
    this.helpFile = undefined;
  }
}

class pTopicRenderer extends IPlugin {
  static EVT_TOPREN_SHOW_CHAPTER = ShowChapter.name;
  static EVT_TOPREN_SHOW_CHAPTER_RES = ShowChapterResolutions.name;
  static EVT_TOPREN_CHAPTER_SHOWN = ChapterShown.name;

  static KEY_CFG_ID_CONTENT = 'IDCONTENT';
  static KEY_CFG_PHASELIST = 'PHASELIST';

  static MARKER_ADDDATA = MARKER_MARKWORD;
  static MARKER_ADDDATA_SPLITTER = ';';

  static STORAGE_DATA = (path) => storageSearch(STO_DATA, path);
  static STORAGE_HELP = (path) => storageSearch(STO_HELP, path);

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID_CONTENT = 'content';
    this.DEFAULT_KEY_CFG_PHASELIST = 'triage;load;%%;unconnected;connected;decorators';
    this.eventIdStrict = true;
  }
  
  init() {
    const T = this.constructor;
    const TI = this;
    
    this.cfgIdContent = this.config[T.KEY_CFG_ID_CONTENT] || TI.DEFAULT_KEY_CFG_ID_CONTENT;
    this.cfgPhaseList = this.config[T.KEY_CFG_PHASELIST] || TI.DEFAULT_KEY_CFG_PHASELIST;

    const h_EVT_TOPREN_SHOW_CHAPTER = (data) => {
      const r = data.result;

      const PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME)?.trim().split('/');
      
      r.STORAGE_NETW = (path) => {
        const pathToRepo = getHelpRepoUri(PRJNAME_VAL[0], PRJNAME_VAL[1]) + path;
        return fetchData(pathToRepo).then((x) => toText(x));
      }

      r.getStorageData = T.STORAGE_HELP;
      r.getAppData = T.STORAGE_DATA;
      r.content = _T('MSG_PATH_NOT_FOUND_IN_ARCH');
      r.helpFile = data.helpFile;

      if (DEBUG_MODE_RENDERER) {
        log('W DEBUG_MODE_RENDERER flag is active, all steps will work to all phases event it should be redirected outside the instance!');
        r.preventDefault();
      }

      r.heading = data.heading || getChapterAlternativeHeading(data.address)[1] || data.address;
      const containerIdContent = data.containerIdContent || this.cfgIdContent;
      r.docV = $(containerIdContent);
      r.doc = r.docV;
      r.uri = typeof data.address === 'string' ? data.address.split(T.MARKER_ADDDATA) : [];
      r.uri.push('');
      
      const splits = r.uri[1].split(T.MARKER_ADDDATA_SPLITTER);

      for (let i = 0; i < splits.length - 1; i += 2)
        r.addData.set(splits[i], splits[i + 1]);

      r.uri = r.uri[0];
      log(`Rendering of ${r.uri} started`);
      r.uriAnchor = r.uri.split('#');
      r.uri = r.uriAnchor[0];

      if (r.uriAnchor && r.uriAnchor.length > 1)
        r.uriAnchor = `#${r.uriAnchor[1]}`;
      else 
        r.uriAnchor = undefined;

      r.type = r.uri ? r.uri.split('/').pop().split('.') : undefined;

      if (r.type && r.type.length > 1)
        r.type = r.type.pop();
      else
        r.type = undefined;

      if (!r.type)
        r.type = 'md';

      r.fileMedium = resolveFileMedium(r.uri);

      var result = Promise.resolve();
      r.result = result;
      var subIds = this.cfgPhaseList;

      if (data.content) {
        log(`Forwarded exact data content in length: ${data.content.length} letters, updating phases list ...`);
        subIds = '%%' + this.cfgPhaseList.split('%%')[1];
        r.content = data.content;
      }
      subIds = subIds.replace('%%', r.type?.substring(0, 3).toLowerCase()).split(';');

      log(`Rendering ${r.uri} phases list:`, subIds);
      
      subIds.forEach((phase) => {
        result = result.then(() => {
          log(`Rendering ${r.uri} phase ${phase} ... sending to plugins with id '${this.aliasName}-${phase}'`);
          return sendEventObject(r, `${this.aliasName}-${phase}`).then(() => {
            log(`Rendering ${r.uri} phase ${phase} ... finished in '${this.aliasName}-${phase}'`);
            if (!r.stopAllPhases)
              r.stop = false;    
          });
        });
      });

      result = result.then(() => {
        log(`Rendering ${r.uri} finished ... sending to output`);

        sendEvent(T.EVT_TOPREN_CHAPTER_SHOWN, (n) => {
          n.heading = r.heading;
          n.content = r.content;
          n.address = r.uri;
          n.addressOrig = data.address;
          n.parentEventId = r.eventId;
          n.id = TI.aliasName;
          n.sourceObject = data.sourceObject;
          n.helpFile = r.helpFile;
        });
      });
    }
    TI.eventDefinitions.push([T.EVT_TOPREN_SHOW_CHAPTER, ShowChapter, h_EVT_TOPREN_SHOW_CHAPTER]);
    TI.eventDefinitions.push([T.EVT_TOPREN_SHOW_CHAPTER_RES, ShowChapterResolutions, null]); // outside event handlers
    TI.eventDefinitions.push([T.EVT_TOPREN_CHAPTER_SHOWN, ChapterShown, null]); // outside event handlers

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
    this.doneVal = Promise.resolve();
  }

  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }

  doc(r) {
    return r.doc.body ? r.doc.body : r.doc;
  }
}
