class HeaderSet extends IEvent {
  constructor() {
    super();
    this.payload = '&nbsp;';
  }
}

class puiHeader extends puiPanel {
  static EVT_HEAD_SET = HeaderSet.name;
  static EVT_HEAD_GET = 'HeaderGet';

  init() {
    const T = this.constructor;
    const TI = this;

    TI.eventIdStrict = false;

    const h1id = 'mtitle';
    const mainTitle = document.createElement('h1');

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

    super.init();

    TI.panel.classList.remove(C_HIDDENC);

    TI.mainTitle = mainTitle;
    mainTitle.innerHTML = '&nbsp;';
    mainTitle.id = h1id;
    TI.panel.prepend(mainTitle);
    TI.panel.id = TI.aliasName;
    TI.panel.role = 'banner';
  }
}

Plugins.catalogize(puiHeader);
