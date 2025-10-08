class puiButtonTab extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.tab = undefined;
  }

  init() {
    super.init(H_BUTTON_WITH_TAB);
    const TI = this;
    TI.tab = TI.button[1];
    TI.button = TI.button[0];
    registerOnClick(TI.button.id, (evt) => TI._buttonAction(evt));
    TI.catalogizeEventCall(TI.init, pui.EVT_CLICK_HANDLER_REGISTER);
    TI.catalogizeEventCall(TI._buttonAction, EventNames.SidebarPageShow);
  }

  deInit() {
    this.tab?.remove();

    super.deInit();
  }

  _preShowAction(evt) {
    log('W puiButtonTab._preShowAction must be overriden in ' + this.constructor.name);
  }

  _buttonAction(evt) {
    const reply = this._preShowAction(evt) == false ? false : true;

    if (reply)
      showSidebarTab(this.tab?.id);
  }
}

Plugins.catalogize(puiButtonTab);
