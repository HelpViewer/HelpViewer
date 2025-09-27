class puiButtonUserNotes extends puiButtonTabTree {
  constructor(aliasName, data) {
    super(aliasName, data);

    this.DEFAULT_KEY_CFG_ID = 'downP-UserNotes';
    this.DEFAULT_KEY_CFG_CAPTION = '✏️';
    this.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    this.DEFAULT_KEY_CFG_TREEID = 'notesList';
  }

  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }

  _preShowAction(evt) {
  }
  
  _preStandardInit() {
    super._preStandardInit?.();

    const T = this.constructor;
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
          x.cursorAddition = TI.cfgCAPTION;
          x.convertedEventId = TI.aliasName;
          //x.id = TI.aliasName;
          //x.handler = test;
        });  
      }
      const callback = EventBus.sub('ActionClickedEvent', test);        
    };

    TI.topPTreeBtn = uiAddButton('notes-add', TI.cfgCAPTION, TI.aliasName, handlerAddNote);

  }

  onETButtonSend(x) {
    this.handlerButtonSend(x);
  }

  onETActionClickedEvent(evt) {
    var target = evt.target;
    const contentPane = target.closest('.content');
    if (!evt.event.isTrusted || !target || !contentPane || target.matches('a') || !target.innerText)
      return;
    const newSpan = document.createElement('span');
    const cssClassUNote = 'usernote';
    if ($O('.' + cssClassUNote, target) )
      return;
    newSpan.classList.add(cssClassUNote);
    newSpan.innerHTML = '<details open><summary></summary><textarea></textarea></details>';
    const code = target.closest('.code-toolbar')
    if (code)
      target = code;
  
    const header = target.closest('h1,h2,h3,h4,h5,h6');
    var before = undefined;
    if (header) {
      if (target.nextElementSibling.classList.contains(cssClassUNote))
        return;
      target = header.parentNode;
      before = header;
    }
    
    if (before)
      before.after(newSpan);
    else
      target.appendChild(newSpan);
    sendEvent('StopActionCursor');
  }
}

Plugins.catalogize(puiButtonUserNotes);
