class WatermarkSet extends IEvent {
  constructor() {
    super();
    this.payload = '';
  }
}

class puiWatermark extends IPlugin {
  static EVT_WATERMARK_SET = WatermarkSet.name;

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

    TI.cssIDName = `addition-${T.name}-${TI.aliasName}`;
    TI.assemble();

    const h_EVT_WatermarkSet = (data) => {
      var payload = data.payload;

      if (payload === undefined || payload === null) {
        data.result = false;
        return;
      }

      TI.cfgTEXT = '';
      TI.cfgIMAGEPATH = '';

      if (typeof payload === 'function') {
        payload = payload();
        TI.cfgIMAGEPATH = payload;
      } else {
        TI.cfgTEXT = payload;
      }

      TI.config[T.KEY_CFG_TEXT] = TI.cfgTEXT;
      TI.config[T.KEY_CFG_IMAGEPATH] = TI.cfgIMAGEPATH;

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

    const isImage = !!TI.cfgIMAGEPATH;
    const isActive = isImage || TI.cfgTEXT;

    $(TI.cssIDName)?.remove();

    const cssResolved = isImage 
      ? "background: url('%%') no-repeat center/contain; opacity: 0.1; width: 100%; height: 100%;".replace('%%', TI.cfgIMAGEPATH)
      :'font-size: 5rem; color: rgba(0, 0, 0, 0.1);';

    const cssSrc = `.${TI.cfgCSSCLASS} { pointer-events: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; ${cssResolved} ${TI.cfgCSSADD} }`;
    appendCSS(TI.cssIDName, cssSrc);

    if (!isActive) {
      if (TI.watermark)
        TI.watermark.innerHTML = '';
      return;
    }

    if (!TI.watermark) {
      const cont = $(TI.cfgPARENT)
      const watermark = document.createElement('span');
      watermark.classList.add(
        ...(TI.cfgCSSCLASS ? [TI.cfgCSSCLASS] : []), 
        ...(TI.cfgADDCSSCLASSES ? TI.cfgADDCSSCLASSES.split(' ') : [])
      );
      watermark.id = `watermark-${T.name}-${TI.aliasName}`;
      TI.watermark = watermark;
      cont.append(watermark);  
    }

    TI.watermark.innerHTML = isImage ? '' : TI.cfgTEXT;
  }

  deInit() {
    this.watermark?.remove();
    $(this.cssIDName)?.remove();
    super.deInit();
  }
}

Plugins.catalogize(puiWatermark);
