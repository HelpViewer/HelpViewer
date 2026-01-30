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
    const mainCSS = $O('#mainCSS')?.textContent;
    if (mainCSS)
      reply['main.css'] = mainCSS;
    const mainCSSPlus = $O('#mainCSSPlus')?.textContent;
    if (mainCSSPlus)
      reply['plus.css'] = mainCSSPlus;
    return reply;
  }
}

Plugins.catalogize(pExport);
