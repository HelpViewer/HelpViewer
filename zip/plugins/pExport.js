const FILENAME_SITEMAPTPL = 'TPL-sitemap.xml';

class pExport extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;
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
