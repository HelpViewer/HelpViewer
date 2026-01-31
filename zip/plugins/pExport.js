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
      if (s)
        reply[`${s.id || newUID()}.css`] = s?.textContent;
    });
    return reply;
  }
}

Plugins.catalogize(pExport);
