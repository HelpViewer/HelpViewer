class ChapterIndexFileSetData extends IEvent {
  constructor() {
    super();
    this.data = undefined;
  }
}

class ChapterIndexFileGetData extends IEvent {
  constructor() {
    super();
    this.key = undefined;
  }
}

class pChapterIndexFile extends IPlugin {
  static EVT_CHF_SET = ChapterIndexFileSetData.name;
  static EVT_CHF_GET = ChapterIndexFileGetData.name;

  static xKEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.pathHeadingAlias = new Map();
    this.idxPath = [];
    this.eventIdStrict = true;
  }

  static eventDefinitions = [];

  init() {
    const T = this.constructor;
    const TI = this;
    const h_EVT_CHF_SET = (data) => {
      if (!data || !data.data) {
        data.result = undefined;
        return false;
      }
      TI._getDocumentHeadingTable(data.data);
      data.result = TI.pathHeadingAlias.size;
    }
    T.eventDefinitions.push([T.EVT_CHF_SET, ChapterIndexFileSetData, h_EVT_CHF_SET]);

    const h_EVT_CHF_GET = (data) => {
      data.result = [TI.idxPath[data.key], TI.pathHeadingAlias.get(TI.idxPath[data.key]) || TI.idxPath[data.key]];
    }
    T.eventDefinitions.push([T.EVT_CHF_GET, ChapterIndexFileGetData, h_EVT_CHF_GET]);

    super.init();
  }

  _getDocumentHeadingTable(data) {
    const transformed = rowsToArray(data);
    const TI = this;
    
    TI.pathHeadingAlias = new Map();
    TI.idxPath = [];
    
    for (const kw of transformed) {
      const [path, title] = kw.split("|");
      TI.idxPath.push(path || '');
      TI.pathHeadingAlias.set(path, title || path || '');
    }
  }

  deInit() {
    super.deInit();
  }

}

Plugins.catalogize(pChapterIndexFile);
