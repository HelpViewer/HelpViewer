class AnchorNameGet extends IEvent {
  constructor() {
    super();
    this.text = '';
    this.level = 1;
    this._internal = undefined;
    this.strategy = '';
    this.result = '';
  }
}

class AnchorNewStrategy extends IEvent {
  constructor() {
    super();
    this.name = '';
    this.handlerGetOne = pTRAnchorName.handlersGetOne[''];
    this.handlerPrepareInternal = pTRAnchorName.handlersPrepareInternal[''];
    this.handlerSolveDuplicity = pTRAnchorName.handlersSolveDuplicity[''];
  }
}

class pTRAnchorName extends IPlugin {
  static EVT_AN_GET = AnchorNameGet.name;
  static EVT_AN_NEWSTRA = AnchorNewStrategy.name;

  static handlersGetOne = {
    '' : () => '',
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
    '' : () => { return {} },
    'COUNT' : () => { return { levelCounter: [0, 0, 0, 0, 0, 0]} },
    'SLUG' : () => { return {} },
  };

  static handlersSolveDuplicity = {
    '' : (tryNo, plannedValue, previousDuplicity, firstDuplicity, data, format) => `${firstDuplicity}-${tryNo}`,
  };

  constructor(aliasName, data) {
    super(aliasName, data);
    this.DEFAULT_KEY_CFG_STRATEGY = 'COUNT';
  }

  init() {
    const T = this.constructor;
    const TI = this;
    
    const h_EVT_AN_GET = (data) => {
      if (!data._internal) {
        const plannedFormat = data.strategy || TI.cfgSTRATEGY;
        const internalObject = T.handlersPrepareInternal[plannedFormat]?.();

        data._internal = { 
          returned: [], 
          format: plannedFormat,
          ...internalObject 
        };
      } else {
        data.strategy = data._internal.strategy;
      }

      const resolvedFormat = data._internal.strategy || TI.cfgSTRATEGY;
      const firstReply = T.handlersGetOne[resolvedFormat](data);
      var reply = firstReply;
      const duplicitySolver = (T.handlersSolveDuplicity[resolvedFormat] || T.handlersSolveDuplicity['']);

      var tryNo = 1;
      var lastDup = reply;
      var firstDup = reply;

      while (data._internal.returned.includes(reply)) {
        reply = duplicitySolver(tryNo, reply, lastDup, firstDup, data, resolvedFormat);
        log(`W ${T.name} : found duplicity in sub chapter name ${data.text}, trying alternative value ${reply} (try: ${tryNo})!`);
        lastDup = reply;
        tryNo++;
      }

      if (tryNo > 1)
        log(`W ${T.name} : duplicity alternative value ${reply} for sub chapter name ${data.text} accepted after try: ${tryNo}.`);

      data._internal.returned.push(reply);
      data.result = reply;
    }
    TI.eventDefinitions.push([T.EVT_AN_GET, AnchorNameGet, h_EVT_AN_GET]);

    const h_EVT_AN_NEWSTRA = (data) => {
      if (!data.name)
        return;

      const altDefaultKey = '';
      T.handlersGetOne[data.name] = data.handlerGetOne || T.handlersGetOne[altDefaultKey];
      T.handlersPrepareInternal[data.name] = data.handlerPrepareInternal || T.handlersPrepareInternal[altDefaultKey];
      T.handlersSolveDuplicity[data.name] = data.handlerSolveDuplicity || T.handlersSolveDuplicity[altDefaultKey];
    }

    TI.eventDefinitions.push([T.EVT_AN_NEWSTRA, AnchorNewStrategy, h_EVT_AN_NEWSTRA]);

    super.init();
  }
}

Plugins.catalogize(pTRAnchorName);
