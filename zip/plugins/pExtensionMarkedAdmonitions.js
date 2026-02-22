class pExtensionMarkedAdmonitions extends pExtensionMarked {
  constructor(aliasName, data) {
    super(aliasName, data);
    const TI = this;
    TI.DEFAULT_KEY_CFG_ROOTCSSCLASS = 'note';
    TI.DEFAULT_KEY_CFG_SMALLADMONTYPESTABLE = '?;note;!;warning';
    TI.loadingState = false;
  }

  init() {
    super.init();
    this.cfgSMALLADMONTYPESTABLE = this.cfgSMALLADMONTYPESTABLE.split(';');
    this.smallAdmonCharsList = this.cfgSMALLADMONTYPESTABLE.filter((_, index) => index % 2 === 0);
    this.smallAdmonCharsRegex = new RegExp(`^(?:${this.smallAdmonCharsList.map(x => `[${x}>]`).join('|')})`);
  }

  onET_PreExportCorrection(e) {
    if (!e || !e.parent) return;

    const cssClass = this.cfgROOTCSSCLASS;
    const willBeUpdated = [...$A(`.${cssClass}`, e.parent)];
    const exportFormatting = new Map([
      ['MD', (id) => `> [!${id}]`],
      ['TEX', (id) => `<strong>[!${id}]</strong> `],
      ['*', (id) => ''],
    ]);
    
    willBeUpdated.forEach(x => {
      const typeClass = x.className.split(' ').filter(Boolean).find(c => c.startsWith(cssClass) && c !== cssClass) || '';
      if (typeClass) {
        const correctionText = (exportFormatting.get(e.exportType) || exportFormatting.get('*'))?.(typeClass.toUpperCase().substring(cssClass.length + 1));
        if (correctionText) {
          const correction = document.createElement('span');
          correction.className = e.CSSClassName;
          correction.innerHTML = correctionText;

          x.prepend(correction);
          e.temporaryObjects.push(correction);
          e.manipulatedObjects.push(x);  
        }
      }
    });
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
    return src.match(/^\s*>?\s*\[!/)?.index || src.match(this.smallAdmonCharsRegex)?.index;
  }

  _handlerTokenizer(src, ctx) {
    let match = src.match(/^(\s*>\s*(?:\\)?\[!([^\]]+)\](?:\s*\n)?)((?:(?!\s*>\s*\[!|\n{1,})[^\n]*\n?)+)/);

    if (match) {
      const type = match[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const token = {
        type: this._getMarkedPluginName(),
        raw: match[0],
        typeClass: type,
        text: match[3].trim().replace(/^>\s*/gm, '')
      };
      return token;
    }

    match = src.match(/^(\s*(?:[!>]|[?>])\s+)((?:(?!\s*[>!][>?]|\n{2,})[\s\S]*?))(?=\n{2,}|\Z)/);

    if (match) {
      log('E MATCH:', match, src);
      const typeResolved = this.cfgSMALLADMONTYPESTABLE.indexOf(match[1]);
      // const token2 = {
      //   type: this._getMarkedPluginName(),
      //   raw: match[0],
      //   typeClass: this.cfgSMALLADMONTYPESTABLE[typeResolved+1],
      //   text: match[2].trim().replace(/^\s*(?>|!>)\s*/gm, '')
      // };
      // return token2;
    }

    return false;
  }

  _handlerRenderer(token) {
    const inner = marked.parse(token.text.replace('\n', '<br/>'));
    return `<div class="${this.cfgROOTCSSCLASS} ${this.cfgROOTCSSCLASS}-${token.typeClass}">${inner}</div>`;
  }
}

Plugins.catalogize(pExtensionMarkedAdmonitions);
