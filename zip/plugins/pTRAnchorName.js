class AnchorNameGet extends IEvent {
  constructor() {
    super();
    this.text = '';
    this.level = '';
    this._internal = undefined;
    this.format = '';
    this.result = '';
  }
}

class AnchorNewStrategy extends IEvent {
  constructor() {
    super();
    this.name = '';
    this.handlerGetOne = (an) => '';
    this.handlerPrepareInternal = () => { return {} };
  }
}

class pTRAnchorName extends IPlugin {
  static EVT_AN_GET = AnchorNameGet.name;
  static EVT_AN_NEWSTRA = AnchorNewStrategy.name;

  static handlersGetOne = {
    'COUNT' : (an) => `h-${an.level}-${an._internal.levelCounter[an.level-1]++}`,
    'SLUG' : (an) => {
      return an.text.toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    },
  };

  static handlersPrepareInternal = {
    'COUNT' : () => { return { levelCounter: [0, 0, 0, 0, 0, 0]} },
    'SLUG' : () => { return {} },
  };

  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_FORMAT = 'COUNT';
  }

  init() {
    const T = this.constructor;
    const TI = this;
    
    const h_EVT_AN_GET = (data) => {
      if (!data._internal) {
        const plannedFormat = data.format || TI.cfgFORMAT;
        const internalObject = T.handlersPrepareInternal[plannedFormat]?.();

        data._internal = { 
          returned: [], 
          format: plannedFormat,
          ...internalObject 
        };
      } else {
        data.format = data._internal.format;
      }

      const resolvedFormat = data._internal.format || TI.cfgFORMAT;
      var reply = T.handlersGetOne[resolvedFormat](data);

      while (data._internal.returned.includes(reply)) {
        reply += '1';
      }

      data._internal.returned.push(reply);
      data.result = reply;
    }
    TI.eventDefinitions.push([T.EVT_AN_GET, AnchorNameGet, h_EVT_AN_GET]);

    const h_EVT_AN_NEWSTRA = (data) => {
      if (!data.name)
        return;

      T.handlersGetOne[data.name] = data.handlerGetOne;
      T.handlersPrepareInternal[data.name] = data.handlerPrepareInternal;
    }

    TI.eventDefinitions.push([T.EVT_AN_NEWSTRA, AnchorNewStrategy, h_EVT_AN_NEWSTRA]);

    super.init();
  }
}

Plugins.catalogize(pTRAnchorName);
