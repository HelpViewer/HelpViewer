class HeaderSet extends IEvent {
  constructor() {
    super();
    this.payload = '&nbsp;';
  }
}

class puiHeader extends IPlugin {
  static EVT_HEAD_SET = HeaderSet.name;
  static EVT_HEAD_GET = 'HeaderGet';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static addition = '<div class="header" id="header" role="banner"><h1 id="mtitle">&nbsp;</h1><div id="toolbar" role="navigation"></div></div>';

  init() {
    const T = this.constructor;
    const TI = this;
    const containerMain = document.getElementById('main');
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = T.addition;
    const node = tmpDiv.firstChild;
    if (containerMain && node)
      containerMain.prepend(node);

    const mainTitle = document.getElementById('mtitle');
    const toolbar = document.getElementById('toolbar');

    const h_EVT_HEAD_SET = (data) => {
      if (typeof data.payload === 'function') {
        data.payload(mainTitle);
      } else {
        mainTitle.innerHTML = data.payload;
      }
      data.result = true;
    }
    TI.eventDefinitions.push([T.EVT_HEAD_SET, HeaderSet, h_EVT_HEAD_SET]);

    const h_EVT_HEAD_GET = (data) => {
      data.result = mainTitle?.innerHTML ?? '';
    }
    TI.eventDefinitions.push([T.EVT_HEAD_GET, IEvent, h_EVT_HEAD_GET]);

    this.handlerButtonSend = createButtonAcceptHandler(this, toolbar);

    super.init();
  }

  deInit() {
    const header = document.getElementById('header');
    header?.remove();
    super.deInit();
  }
  
  onETButtonSend(x) {
    this.handlerButtonSend(x);
  }
}

Plugins.catalogize(puiHeader);
