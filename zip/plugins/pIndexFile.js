class IndexFileSetData extends IEvent {
  constructor() {
    super();
    this.data = undefined;
  }
}

class IndexFileGetData extends IEvent {
  constructor() {
    super();
    this.key = undefined;
    this.cap = 100;
  }
}

class pIndexFile extends IPlugin {
  static EVT_IF_SET = IndexFileSetData.name;
  static EVT_IF_GET = IndexFileGetData.name;

  static xKEY_CFG_FILENAME = 'FILENAME';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];

  init() {
    const T = this.constructor;
    const h_EVT_IF_SET = (data) => {
    }
    T.eventDefinitions.push([T.EVT_IF_SET, IndexFileSetData, h_EVT_IF_SET]);

    const h_EVT_IF_GET = (data) => {
    }
    T.eventDefinitions.push([T.EVT_IF_GET, IndexFileGetData, h_EVT_IF_GET]);

    super.init();
    this.eventIdStrict = true;
  }

  deInit() {
    super.deInit();
  }

}

Plugins.catalogize(pIndexFile);
