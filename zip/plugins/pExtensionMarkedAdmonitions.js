class pExtensionMarkedAdmonitions extends pExtensionMarkedMd {
  constructor(aliasName, data) {
    super(aliasName, data);
    const TI = this;
    TI.DEFAULT_KEY_CFG_ROOTCSSCLASS = 'note';
    TI.loadingState = false;
  }

  onET_MarkedExtend(e) {
    const styleId = 'admonitions.css';

    if (!$(styleId) && !this.loadingState) {
      this.loadingState = true;
      const RES = new Resource('MARKED-ADMONITION', undefined, STO_DATA, styleId);
      RES.init();
    }
  }

  _initHandlingObject(o) {
    o.childTokens = ['paragraph', 'text', 'code'];
  }

  _handlerStart(src) {
    return src.match(/^\s*>?\s*\[!/)?.index;
  }

  _handlerTokenizer(src, ctx) {
    const match = src.match(/^(\s*>\s*(?:\\)?\[!([^\]]+)\](?:\s*\n)?)((?:(?!\s*>\s*\[!|\n{1,})[^\n]*\n?)+)/);

    if (!match) return false;
    const type = match[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const token = {
      type: this._getMarkedPluginName(),
      raw: match[0],
      typeClass: type,
      text: match[3].trim().replace(/^>\s*/gm, '')
    };
    return token;
  }

  _handlerRenderer(token) {
    const inner = marked.parse(token.text.replace('\n', '<br/>'));
    return `<div class="${this.cfgROOTCSSCLASS} ${this.cfgROOTCSSCLASS}-${token.typeClass}">${inner}</div>`;
  }
}

Plugins.catalogize(pExtensionMarkedAdmonitions);
