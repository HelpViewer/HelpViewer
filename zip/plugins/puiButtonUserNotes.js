class puiButtonUserNotes extends puiButtonTabTree {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-UserNotes';
    this.DEFAULT_KEY_CFG_CAPTION = '📝';
    this.DEFAULT_KEY_CFG_EDITCAPTION = '✏️';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_TREEID = 'notesList';
    this.DEFAULT_KEY_CFG_IDCONTENT = 'content';
    this.DEFAULT_KEY_CFG_CSSCLASS = 'usernote';
    this.DEFAULT_KEY_CFG_NOTESONLYTEXT = 1;
  }

  init() {
    super.init();

    const T = this.constructor;
    const TI = this;

    const contentPane = $(TI.cfgIDCONTENT);

    if (!contentPane)
      return;

    if (TI.cfgNOTESONLYTEXT) {
      TI.NOTE_PASTE = new SystemEventHandler('', undefined, contentPane, 'paste', (e) => this._handleForNote(e, this._handlePaste.bind(this)));
      TI.NOTE_PASTE.init();  
    }

    TI.NOTE_BLUR = new SystemEventHandler('', undefined, contentPane, 'focusout', (e) => this._handleForNote(e, this._handleBlur.bind(this)));
    TI.NOTE_BLUR.init();  

  }

  deInit() {
    super.deInit();
  }

  _handleForNote(e, handler) {
    if (e.target.matches('.' + this.cfgCSSCLASS)) {
      handler(e);
    }
  }

  _handlePaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const sel = window.getSelection();
    if (!sel.rangeCount || !text) return;
  
    const textRange = sel.getRangeAt(0);
    textRange.deleteContents();
  
    const textNode = document.createTextNode(text);
    textRange.insertNode(textNode);
  
    textRange.setStartAfter(textNode);
    textRange.setEndAfter(textNode);
  }

  _handleBlur(e) {
    log('E note text:"' + e.target.innerText + '"');
    e.target.innerHTML = e.target.innerText;
    if (!e.target.innerText) {
      e.target.remove();
    }
  }

  _preShowAction(evt) {
  }
  
  _preStandardInit() {
    super._preStandardInit?.();

    const TI = this;

    const pnlName = 'notesP';
    var topPanel = `<div class="toolbar toolbar-down" id='${pnlName}'></div>`;
    TI.tab?.insertAdjacentHTML('afterbegin', topPanel);
    topPanel = $(pnlName);
    TI.handlerButtonSend = createButtonAcceptHandler(TI, topPanel);

    const handlerAddNote = (e) => {
      const replyStop = sendEvent('StopActionCursor');//, (x) => x.id = TI.aliasName);
      if (!replyStop) {
        sendEvent('SetActionCursor', (x) => {
          x.cursorAddition = TI.cfgEDITCAPTION;
          x.convertedEventId = TI.aliasName;
        });  
      }
    };

    TI.topPTreeBtn = uiAddButton('notes-add', TI.cfgEDITCAPTION, TI.aliasName, handlerAddNote);
  }

  onETButtonSend(x) {
    this.handlerButtonSend(x);
  }

  onETActionClickedEvent(evt) {
    var target = evt.target;
    const contentPane = target.closest('#' + this.cfgIDCONTENT);
    if (!evt.event.isTrusted || !target || !contentPane || target.matches('a') || !target.innerText)
      return;
    const newSpan = document.createElement('span');
    const cssClassUNote = this.cfgCSSCLASS;

    newSpan.classList.add(cssClassUNote);
    newSpan.innerHTML = ``;
    newSpan.setAttribute('contenteditable', 'true');
    
    // Prism source dumps
    const code = target.closest('.code-toolbar')
    if (code)
      target = code;
  
    // Headers
    const header = target.closest('h1,h2,h3,h4,h5,h6');
    var before = undefined;
    if (header) {
      if (target.nextElementSibling.classList.contains(cssClassUNote))
        return;
      target = header.parentNode;
      before = header;
    }

    // Previous user note
    const isUserNote = target.closest('.' + cssClassUNote);

    if (!isUserNote) {
      if (before)
        before.after(newSpan);
      else
        target.appendChild(newSpan);  
    }

    newSpan.focus();
   
    sendEvent('StopActionCursor');
  }
}

Plugins.catalogize(puiButtonUserNotes);
