class PrepareExport extends IEvent {
  constructor() {
    super();
    this.data = [];
    this.output = undefined;
    this.parent = undefined;
  }
}

class puiButtonExport extends puiButtonSelect {
  static EVT_BE_GETEXPORTFORMAT = 'GetExportFormat';
  static EVT_BE_PREPEXPORT = 'PrepareExport';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-export';
    this.DEFAULT_KEY_CFG_CAPTION = '📥';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_HEADER;
    this.DEFAULT_KEY_CFG_CONTENTID = 'content';
  }

  async init() {
    const T = this.constructor;
    const TI = this;

    TI.eventDefinitions.push([T.EVT_BE_GETEXPORTFORMAT, IEvent, null]);
    TI.eventDefinitions.push([T.EVT_BE_PREPEXPORT, PrepareExport, null]);

    TI.catalogizeEventCall(this._handle, T.EVT_BE_GETEXPORTFORMAT);
    TI.catalogizeEventCall(this._handle, T.EVT_BE_PREPEXPORT);

    super.init();
    TI.main.classList.add(C_HIDDENCPRESMODE);
  }

  deInit() {
    super.deInit();
  }

  async _handle(e) {
    const T = this.constructor;
    const TI = this;

    const parent = $(TI.cfgCONTENTID);
    const data = $A("*", parent);

    const zip = new JSZip();

    let i = 0;
    let imgs = $A("img", parent);

    for (const c of imgs) {
      i++;
      let data;
    
      if (c.src.startsWith('http')) {
        data = await fetchData(c.src);
      } else {
        data = dataUrlRawDataToBlob(c.src);
      }
    
      zip.file(`src/img_${i}`, data);
    }

    i = 0;
    const serializer = new XMLSerializer();
    $A("svg", parent).forEach(c => {
      i++;
      zip.file(`src/svg_${i}.svg`, serializer.serializeToString(c));
    });

    sendEvent(T.EVT_BE_PREPEXPORT, (x) => {
      x.data = data;
      x.parent = parent;
      x.output = zip
      x.id = e.target.options[e.target.selectedIndex].text;
      x.doneHandler = () => zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then(x => prepareDownload(x, 'export.zip'));
    });
  }

  async _handleFocus(e) {
    const T = this.constructor;
    const TI = this;

    var types = null;
    sendEvent(T.EVT_BE_GETEXPORTFORMAT, (x) => {
      x.result = [''];
      types = x.result;
    });

    TI.select.options.length = 0;
    appendComboBoxItems(TI.select, types, null);
  }

  onET_UserDataFileLoaded(evt) {
  }
}

Plugins.catalogize(puiButtonExport);
