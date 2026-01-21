class pExportMD extends pExport {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  async init() {
    super.init();

    const TI = this;
  }

  deInit() {
    super.deInit();
  }

  onET_GetExportFormat(evt) {
    evt.result.push('MD');
  }

  onETPrepareExport(evt) {
    //evt.data
    alert('0');
  }
}

Plugins.catalogize(pExportMD);
