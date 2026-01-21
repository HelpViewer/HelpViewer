class pExport extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;
  }

  getPlainCodeFromPrism(element) {
    if (!element) return null;
    if (element.dataset.src) return element.dataset.src;
    return element.textContent;
  }
}

Plugins.catalogize(pExport);
