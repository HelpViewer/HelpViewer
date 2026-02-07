class pExtensionMarked extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    const TI = this;
    TI.active = false;
    TI.DEFAULT_KEY_CFG_LEVEL = 'block';
  }

  _getMarkedPluginName() {
    return `${this.constructor.name}-${this.aliasName}`;
  }

  onET_MarkedExtend(e) {
    const TI = this;
    TI.active = true;

    const handlingObject = {
      name: TI._getMarkedPluginName(),
      level: TI.cfgLEVEL,
      start(src) { return TI.active ? TI._handlerStart(src) : undefined; },
      tokenizer(src, ctx) {
        if (!TI.active) return false;
        return TI._handlerTokenizer(src, ctx);
      },
      renderer(token) {
        return TI._handlerRenderer(token);
      },
    };

    TI._initHandlingObject(handlingObject);
    marked?.use({ extensions: [handlingObject] });
  }

  _initHandlingObject(o) {
  }

  _handlerStart(src) {
  }

  _handlerTokenizer(src, ctx) {
  }

  _handlerRenderer(token) {
  }

  deInit() {
    this.active = false;
    super.deInit();
  }
}

Plugins.catalogize(pExtensionMarked);
