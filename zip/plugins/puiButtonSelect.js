class ButtonSelectIconSet extends IEvent {
  constructor() {
    super();
    this.payload = '';
  }
}

class puiButtonSelect extends IPlugin {
  static EVT_BUSE_SET = ButtonSelectIconSet.name;

  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = this.DEFAULT_KEY_CFG_ID || 'downP-X';
    this.DEFAULT_KEY_CFG_CAPTION = this.DEFAULT_KEY_CFG_CAPTION || 'X';
    this.DEFAULT_KEY_CFG_TARGET = this.DEFAULT_KEY_CFG_TARGET || UI_PLUGIN_SIDEBAR;

    this.eventIdStrict = true;
  }

  init() {
    const T = this.constructor;
    const TI = this;

    const main = document.createElement('div');
    TI.main = main;
    main.id = TI.cfgID;
    main.classList.add('btn-select');

    const h_EVT_BUSE_SET = (data) => {
      var val = data?.payload || undefined;
      if (!val)
        val = TI.cfgCAPTION;

      main.setAttribute('data-icon', val);

      if (data)
        data.result = true;
    }
    TI.eventDefinitions.push([T.EVT_BUSE_SET, ButtonSelectIconSet, h_EVT_BUSE_SET]);
    h_EVT_BUSE_SET(undefined);

    const select = document.createElement('select');
    TI.select = select;
    select.id = `${TI.cfgID}-sel`;
    main.append(select);

    TI.catalogizeEventCall(TI.init, EventNames.ButtonSend);
    sendEvent(EventNames.ButtonSend, (x) => {
      x.button = main;
      x.id = TI.cfgTARGET;
    });

    TI.targetSysObject = SystemEventHandler.getTargetFromName(`#${TI.cfgID}-sel`);

    TI.eventOnChange = new SystemEventHandler('', undefined, TI.targetSysObject, 'change', TI._handle.bind(TI));
    TI.eventOnChange.init();

    TI.eventOnFocus = new SystemEventHandler('', undefined, TI.targetSysObject, 'focus', TI._handleFocus.bind(TI));
    TI.eventOnFocus.init();
    super.init();
  }

  deInit() {
    super.deInit();

    this.main?.remove();
    this.select?.remove();
  }

  _handle(e) {
    log(`W ${this.constructor.name} : ${this.cfgID} - ${e.target.value} (${e.target.options[e.target.selectedIndex].text}) - override this handler.`);
  }

  _handleFocus(e) {
  }
}

Plugins.catalogize(puiButtonSelect);
