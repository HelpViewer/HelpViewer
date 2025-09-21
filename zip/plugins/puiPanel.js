class puiPanel extends IPlugin {
  static addition = '<div class="header" id="%%-panel"><div id="%%-toolbar" role="navigation"></div></div>';

  static KEY_CFG_POSITION = 'POSITION';
  static KEY_CFG_BASEELEMENTID = 'BASEELEMENTID';

  init() {
    const T = this.constructor;
    const TI = this;

    const positions = {
      t: 't',
      b: 'b',
    };

    this.DEFAULT_KEY_CFG_POSITION = positions.t;
    this.DEFAULT_KEY_CFG_BASEELEMENTID = 'content';

    TI.cfgPosition = TI.config[T.KEY_CFG_POSITION] || TI.DEFAULT_KEY_CFG_POSITION;
    TI.cfgBaseElementId = TI.config[T.KEY_CFG_BASEELEMENTID] || TI.DEFAULT_KEY_CFG_BASEELEMENTID;

    const containerRelativeTo = $(TI.cfgBaseElementId);
    const parent = containerRelativeTo.parentElement;
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = T.addition.replace(new RegExp('%%', 'g'), this.aliasName);
    const node = tmpDiv.firstChild;
    
    if (containerRelativeTo && node) {
      if (TI.cfgPosition == positions.t) {
        parent.insertBefore(node, containerRelativeTo);
      } else 
      if (TI.cfgPosition == positions.b) {
        parent.insertBefore(node, containerRelativeTo.nextSibling);
      }
    }

    this.panel = node;
    this.panel.classList.add(C_HIDDENC);

    const toolbar = $(this.aliasName + '-toolbar');

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
