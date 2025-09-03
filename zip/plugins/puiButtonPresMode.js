class puiButtonPresMode extends puiButton {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-TogglePresMode';
    this.DEFAULT_KEY_CFG_CAPTION = '📽';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.presModeCSSAddName = 'presModeCSSAdd';
  }

  static KEY_CFG_NAVIGATIONID = 'NAVIGATIONID';

  init() {
    const T = this.constructor;
    const TI = this;

    this.DEFAULT_KEY_CFG_NAVIGATIONID = 'nav';
    this.navigationId = TI.config[T.KEY_CFG_NAVIGATIONID] || TI.DEFAULT_KEY_CFG_NAVIGATIONID;

    super.init();

    this.fsFunction = this._fullScreenChange.bind(this);
    this._keyPressHandlerFunction = this._keyPressHandler.bind(this);
    document.addEventListener("fullscreenchange", this.fsFunction);

    TI.catalogizeEventCall(TI._keyPressHandler, EventNames.DoNavigationMove);

    TI.catalogizeEventCall(TI._fullScreenChange, EventNames.SidebarVisibilitySet);

    TI.catalogizeEventCall(TI._buttonAction, EventNames.SidebarVisibilitySet);
  }

  deInit() {
    super.deInit();

    document.removeEventListener("fullscreenchange", this.fsFunction);
  }

  _keyPressHandler(e) {
    const aLeft = 'ArrowLeft';
    const aRight = 'ArrowRight';
    const aUp = 'ArrowUp';
    const aDown = 'ArrowDown';
    const evtNameNav = 'DoNavigationMove';

    if (![aLeft, aRight, aUp, aDown].includes(e.key)) {
      return;
    }
  
    let scrollable = $('content');
    
    if (scrollable) {
      const { scrollTop, scrollHeight, clientHeight } = scrollable;
  
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight;
  
      if (e.key === aUp && !atTop) return;
      if (e.key === aDown && !atBottom) return;
    }

    if (e.key === aRight || e.key === aDown) {
      e.preventDefault();
      sendEvent(evtNameNav, (x) => {
        x.direction = 1;
        x.id = this.navigationId;
        x.event = e;
      });
    }
    if (e.key === aLeft || e.key === aUp) {
      e.preventDefault();
      sendEvent(evtNameNav, (x) => {
        x.direction = -1;
        x.id = this.navigationId;
        x.event = e;
      });
    }
  }

  _fullScreenChange() {
    if (document.fullscreenElement) {
    } else {
      $(this.presModeCSSAddName)?.remove();
      toggleSidebar(true);
      document.removeEventListener("keydown", this._keyPressHandlerFunction);
    }
  }

  _buttonAction(evt) {
    const presModeCSSAdd = `.${C_HIDDENCPRESMODE} { display: none; }`;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
      toggleSidebar(false);
      appendCSS(this.presModeCSSAddName, presModeCSSAdd);
      document.addEventListener("keydown", this._keyPressHandlerFunction);
    }
  }
}

Plugins.catalogize(puiButtonPresMode);
