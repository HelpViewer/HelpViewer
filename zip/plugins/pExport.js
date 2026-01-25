class pExport extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;
  }

  onET_GetExportFormat(evt) {
    evt.result.push(this.aliasName);
  }
}

Plugins.catalogize(pExport);
