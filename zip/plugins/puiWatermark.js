class WatermarkSet extends IEvent {
  constructor() {
    super();
    this.payload = '';
  }
}

class puiWatermark extends IPlugin {
  static EVT_WATERMARK_SET = WatermarkSet.name;

  static KEY_CFG_PARENT = 'PARENT';
  static KEY_CFG_TEXT = 'TEXT';
  static KEY_CFG_IMAGEPATH = 'IMAGEPATH';
  static KEY_CFG_CSSADD = 'CSSADD';
  static KEY_CFG_CSSCLASS = 'CSSCLASS';
  static KEY_CFG_ADDCSSCLASSES = 'ADDCSSCLASSES';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;

    this.DEFAULT_KEY_CFG_PARENT = 'main';
    this.DEFAULT_KEY_CFG_TEXT = '';
    this.DEFAULT_KEY_CFG_IMAGEPATH = '';
    this.DEFAULT_KEY_CFG_CSSADD = '';
    this.DEFAULT_KEY_CFG_CSSCLASS = 'watermark-' + aliasName;
    this.DEFAULT_KEY_CFG_ADDCSSCLASSES = 'hiddenprint';
  }

  init() {
    const T = this.constructor;
    const TI = this;

    TI.cfgIdParent = TI.config[T.KEY_CFG_PARENT] || TI.DEFAULT_KEY_CFG_PARENT;
    TI.cfgText = TI.config[T.KEY_CFG_TEXT] || TI.DEFAULT_KEY_CFG_TEXT;
    TI.cfgImage = TI.config[T.KEY_CFG_IMAGEPATH] || TI.DEFAULT_KEY_CFG_IMAGEPATH;
    TI.cfgCSSAdd = TI.config[T.KEY_CFG_CSSADD] || TI.DEFAULT_KEY_CFG_CSSADD;
    TI.cfgCSSClass = TI.config[T.KEY_CFG_CSSCLASS] || TI.DEFAULT_KEY_CFG_CSSCLASS;
    TI.cfgAddCSSClasses = TI.config[T.KEY_CFG_ADDCSSCLASSES] || TI.DEFAULT_KEY_CFG_ADDCSSCLASSES;
    
    TI.cssIDName = `addition-${T.name}-${TI.aliasName}`;
    TI.assemble();

    const h_EVT_WatermarkSet = (data) => {
      var payload = data.payload;

      if (payload === undefined || payload === null) {
        data.result = false;
        return;
      }

      TI.cfgText = '';
      TI.cfgImage = '';

      if (typeof payload === 'function') {
        payload = payload();
        TI.cfgImage = payload;
      } else {
        TI.cfgText = payload;
      }

      TI.config[T.KEY_CFG_TEXT] = TI.cfgText;
      TI.config[T.KEY_CFG_IMAGEPATH] = TI.cfgImage;

      TI.assemble();
      data.result = true;
      return;
    };
    TI.eventDefinitions.push([T.EVT_WATERMARK_SET, WatermarkSet, h_EVT_WatermarkSet]);

    super.init();
  }

  assemble() {
    const T = this.constructor;
    const TI = this;

    const isImage = !!TI.cfgImage;
    const isActive = !!TI.cfgImage || TI.cfgText;

    $(TI.cssIDName)?.remove();

    const cssResolved = isImage 
      ? "background: url('%%') no-repeat center/contain; opacity: 0.1; width: 100%; height: 100%;".replace('%%', TI.cfgImage)
      :'font-size: 5rem; color: rgba(0, 0, 0, 0.1);';

    const cssSrc = `.${TI.cfgCSSClass} { pointer-events: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; ${cssResolved} ${TI.cfgCSSAdd} }`;
    appendCSS(TI.cssIDName, cssSrc);

    if (!isActive) {
      if (TI.watermark)
        TI.watermark.innerHTML = '';
      return;
    }

    if (!TI.watermark) {
      const cont = $(TI.cfgIdParent)
      const watermark = document.createElement('span');
      watermark.classList.add(
        ...(TI.cfgCSSClass ? [TI.cfgCSSClass] : []), 
        ...(TI.cfgAddCSSClasses ? TI.cfgAddCSSClasses.split(' ') : [])
      );
      watermark.id = `watermark-${T.name}-${TI.aliasName}`;
      TI.watermark = watermark;
      cont.append(watermark);  
    }

    TI.watermark.innerHTML = isImage ? '' : TI.cfgText;
  }

  deInit() {
    this.watermark?.remove();
    $(this.cssIDName)?.remove();
    super.deInit();
  }
}

Plugins.catalogize(puiWatermark);
