class puiSplash extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_RELATIVE = 'container';
    this.DEFAULT_KEY_CFG_FILENAME = '_splash.md';
    this.DEFAULT_KEY_CFG_IDNAME = 'splash';
    this.DEFAULT_KEY_CFG_CSSCLASS = 'splash';
    this.DEFAULT_KEY_CFG_HOME = FILENAME_1STTOPIC;
    this.eventIdStrict = true;

    this.show = (file) => showChapter(undefined, undefined, file, undefined, undefined, undefined, this.splashPanel.id);
  }
  
  onETChapterShown(evt) {
    this.lastOrig = evt.addressOrig;
    this._prepare(evt.addressOrig);
  }

  onETLOC_LOADED(d) {
    const TI = this;

    if (TI.splashPanel)
      TI.show(TI.cfgFILENAME);
  }

  _prepare(addressOrig) {
    const TI = this;
    const homePage = TI.cfgHOME;
    const relative = $(TI.cfgRELATIVE);

    if (!addressOrig || !TI.cfgFILENAME || !homePage || !relative)
      return;

    if (addressOrig != homePage) {
      if (addressOrig == TI.cfgFILENAME)
        return;

      if (TI.splashPanel)
        TI.splashPanel.remove();

      //TI.splashPanel = undefined;
      TI.splashPanel = null;
      return;
    }

    if (!TI.splashPanel && TI.splashPanel !== null) {
      storageSearch(STO_HELP, TI.cfgFILENAME).then(c => {
        if (c) {
          const sp = document.createElement('div');
          TI.splashPanel = sp;
          sp.classList.add(TI.cfgCSSCLASS);
          sp.id = TI.cfgIDNAME;
          relative.parentElement.insertBefore(sp, relative);
          TI.show(TI.cfgFILENAME);
        }
      });
    }

  }
}

Plugins.catalogize(puiSplash);
