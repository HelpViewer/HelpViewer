const FILENAME_SITEMAPTPL = 'TPL-sitemap.xml';
const FILENAME_INDEXHTM = 'index.htm';

class PreExportCorrection extends IEvent {
  constructor() {
    super();
    this.CSSClassName = 'preExportCorrection';
    this.exportType = '';
    this.temporaryObjects = [];
    this.manipulatedObjects = [];
    this.parent = undefined;
    //(event, object) => return correction object
  }
}

class pExport extends IPlugin {
  static EVT_E_CORRECTION = PreExportCorrection.name;

  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;
  }

  async init() {
    const T = this.constructor;
    const TI = this;

    TI.eventDefinitions.push([T.EVT_E_CORRECTION, PreExportCorrection, null]);

//    TI.catalogizeEventCall(this._handle, T.EVT_BE_PREPEXPORT);

    super.init();
  }

  onET_GetExportFormat(evt) {
    evt.result.push(this.aliasName);
  }

  getStyles() {
    const reply = {};
    Array.from($A('style', document.head)).forEach(s => {
      if (s) {
        const id = s.id || newUID();
        //if (!id.startsWith('t-'))
        reply[`${id}.css`] = s?.textContent;
      }
    });
    return reply;
  }

  removeSVG(output) {
    Array.from(output.keys()).forEach(k => {
      if (k.endsWith('.svg'))
        output.delete(k);
    });
  }

  async getFavicon(parent = document) {
    var link = $O("link[rel~='icon']", parent);

    if (link) {
      let data;
      
      if (!link?.href.startsWith('data:')) {
        data = await fetchDataOrZero(link.href);
      } else {
        data = dataUrlRawDataToBlob(link.href);
      }

      return data;
    }

    return undefined;
  }
}

Plugins.catalogize(pExport);
