class puiPanel extends IPlugin {
  static addition = '<div class="header" id="%%-bottomPanel"><div id="%%-toolbarBottom" role="navigation"></div></div>';

  init() {
    const T = this.constructor;
    const TI = this;

    const containerMain = $('main');
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = T.addition.replace(new RegExp('%%', 'g'), this.aliasName);
    const node = tmpDiv.firstChild;
    if (containerMain && node)
      containerMain.append(node);
    this.panel = node;
    this.panel.classList.add(C_HIDDENC);

    const toolbar = $(this.aliasName + '-toolbarBottom');

    const baseButtonAccept = createButtonAcceptHandler(TI, toolbar);
    this.handlerButtonSend = (x) => {
      this.panel.classList.remove(C_HIDDENC);
      baseButtonAccept(x);
    }

    super.init();
  }

  deInit() {
    this.panel?.remove();
    super.deInit();
  }
  
  onETButtonSend(x) {
    this.handlerButtonSend(x);
  }
}

Plugins.catalogize(puiPanel);
