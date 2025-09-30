class ShowChapterResolutions extends IEvent {
  constructor() {
    super();
    this.heading = '';
    this.content = '';
    this.uri = '';
    this.fileMedium = '';
    this.uriAnchor = '';
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
    this.TOKEN_NONOTFOUNDMSG = 'TOKEN_NONOTFOUNDMSG';

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
    this.helpFile = '';
    this.found = false;
    this.contentType = undefined;
    this.containerIdContent = '';
    this.targetOverriden = false;
  }
}

class ShowChapter extends IEvent {
  constructor() {
    super();
    this.event = undefined;
    this.heading = '';
    this.address = '';
    this.sourceObject = undefined;
    this.result = new ShowChapterResolutions();
    this.result.parentEventId = this.eventId;
    //this.result.parentEvent = this;
    this.result.preventDefault = () => this.event?.preventDefault?.();
    this.containerIdContent = '';
    this.helpFile = '';
  }
}

class ChapterShown extends IEvent {
  constructor() {
    super();
    this.heading = '';
    this.content = '';
    this.address = '';
    this.addressOrig = '';
    this.sourceObject = undefined;
    this.helpFile = '';
    this.found = false;
    this.contentType = undefined;
  }
}

class pTopicRenderer extends IPlugin {
  static EVT_TOPREN_SHOW_CHAPTER = ShowChapter.name;
  static EVT_TOPREN_SHOW_CHAPTER_RES = ShowChapterResolutions.name;
  static EVT_TOPREN_CHAPTER_SHOWN = ChapterShown.name;

  static MARKER_ADDDATA = MARKER_MARKWORD;
  static MARKER_ADDDATA_SPLITTER = ';';

  static STORAGE_DATA = (path) => storageSearch(STO_DATA, path);
  static STORAGE_HELP = (path) => storageSearch(STO_HELP, path);

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_IDCONTENT = 'content';
    this.DEFAULT_KEY_CFG_PHASELIST = 'triage;load;%%;unconnected;connected;decorators';
    this.eventIdStrict = true;
  }
  
  init() {
    const T = this.constructor;
    const TI = this;
    
    const h_EVT_TOPREN_SHOW_CHAPTER = (data) => {
      const r = data.result;

      const PRJNAME_VAL = configGetDataProjectFile().split('/');
      
      r.STORAGE_NETW = (path) => {
        const pathToRepo = (r.helpFile || getHelpRepoUri(PRJNAME_VAL[0], PRJNAME_VAL[1])) + path;
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

      r.heading = data.heading || getChapterAlternativeHeading(data.address)?.[1] || data.address;
      const containerIdContent = data.containerIdContent || TI.cfgIDCONTENT;
      r.containerIdContent = containerIdContent;
      r.docV = $(containerIdContent);
      r.doc = r.docV;
      r.uri = typeof data.address === 'string' ? data.address.split(T.MARKER_ADDDATA) : [];
      r.uri.push('');
      r.targetOverriden = r.containerIdContent != TI.cfgIDCONTENT;
      
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
      var subIds = this.cfgPHASELIST;

      if (data.content) {
        log(`Forwarded exact data content in length: ${data.content.length} letters, updating phases list ...`);
        subIds = '%%' + this.cfgPHASELIST.split('%%', 2)[1];
        r.content = data.content;
      }
      subIds = subIds.replace(new RegExp('%%', 'g'), r.type?.substring(0, 3).toLowerCase()).split(';');

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
          n.found = r.found;
          n.contentType = r.contentType;
        });
      });
    }
    TI.eventDefinitions.push([T.EVT_TOPREN_SHOW_CHAPTER, ShowChapter, h_EVT_TOPREN_SHOW_CHAPTER]);

    const n_h_EVT_TOPREN_SHOW_CHAPTER = 'h_EVT_TOPREN_SHOW_CHAPTER';
    TI.catalogizeEventCall(n_h_EVT_TOPREN_SHOW_CHAPTER, EventNames.ConfigFileGet);
    TI.catalogizeEventCall(n_h_EVT_TOPREN_SHOW_CHAPTER, EventNames.ChapterIndexFileGetData);
    TI.catalogizeEventCall(n_h_EVT_TOPREN_SHOW_CHAPTER, T.EVT_TOPREN_SHOW_CHAPTER_RES);
    TI.catalogizeEventCall(n_h_EVT_TOPREN_SHOW_CHAPTER, T.EVT_TOPREN_CHAPTER_SHOWN);

    TI.eventDefinitions.push([T.EVT_TOPREN_SHOW_CHAPTER_RES, ShowChapterResolutions, null]); // outside event handlers
    TI.eventDefinitions.push([T.EVT_TOPREN_CHAPTER_SHOWN, ChapterShown, null]); // outside event handlers

    super.init();
  }

}

Plugins.catalogize(pTopicRenderer);

class pTRPhasePlugin extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;
    this.doneVal = Promise.resolve();
  }
  
  doc(r) {
    return r.doc.body ? r.doc.body : r.doc;
  }
}

Plugins.catalogize(pTRPhasePlugin);
