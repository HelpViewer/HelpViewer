class puiPanel extends IPlugin {
  static addition = '<div class="header" id="%%-panel"><div id="%%-toolbar" role="navigation"></div></div>';

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_POSITION = 't';
    this.DEFAULT_KEY_CFG_BASEELEMENTID = 'content';

    this.eventIdStrict = true;
  }

  init() {
    const T = this.constructor;
    const TI = this;

    const positions = {
      t: 't',
      b: 'b',
    };

    const containerRelativeTo = $(TI.cfgBASEELEMENTID);
    const parent = containerRelativeTo.parentElement;
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = T.addition.replace(new RegExp('%%', 'g'), TI.aliasName);
    const node = tmpDiv.firstChild;
    
    if (containerRelativeTo && node) {
      if (TI.cfgPOSITION == positions.t) {
        parent.insertBefore(node, containerRelativeTo);
      } else 
      if (TI.cfgPOSITION == positions.b) {
        parent.insertBefore(node, containerRelativeTo.nextSibling);
        node.classList.add(C_BOTTOMPANEL);
      }
    }

    TI.panel = node;
    TI.panel.classList.add(C_HIDDENC);

    const toolbar = $(TI.aliasName + '-toolbar');
    TI.toolbar = toolbar;

    const baseButtonAccept = createButtonAcceptHandler(TI, TI.toolbar);
    TI.handlerButtonSend = (x) => {
      TI.panel.classList.remove(C_HIDDENC);
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
