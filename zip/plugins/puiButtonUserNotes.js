class puiButtonUserNotes extends puiButtonTabTree {
  static EVT_UN_SETNOTESVISIBILITY = 'SetNotesVisibility';

  constructor(aliasName, data) {
    super(aliasName, data);

    const TI = this;
    TI.DEFAULT_KEY_CFG_ID = 'downP-UserNotes';
    TI.DEFAULT_KEY_CFG_CAPTION = '✏️';
    TI.DEFAULT_KEY_CFG_TARGET = UI_PLUGIN_SIDEBAR;

    TI.DEFAULT_KEY_CFG_TREEID = 'notesList';
    TI.DEFAULT_KEY_CFG_IDCONTENT = 'content';
    TI.DEFAULT_KEY_CFG_CSSCLASS = 'usernote';
    TI.DEFAULT_KEY_CFG_NOTESONLYTEXTCLIPBOARD = 1;
    TI.DEFAULT_KEY_CFG_NOTESONLYTEXTMANTYPED = 0;
    TI.DEFAULT_KEY_CFG_NOTESTYPEDFILTEROUTHTML = 'script;iframe;img;button;input;frameset;srcdoc;object;embed;applet;video;audio;form;style;base;link;meta';
    TI.DEFAULT_KEY_CFG_CAPTIONNOTESVISIBLE = '🙈👁️';
    TI.DEFAULT_KEY_CFG_CFGKEYNOTESVISIBLE = 'notesVisible';
    TI.DEFAULT_KEY_CFG_EDITCAPTION = TI.DEFAULT_KEY_CFG_CAPTION;
  }

  init() {
    const T = this.constructor;
    const TI = this;

    const contentPane = $(TI.cfgIDCONTENT);

    if (!contentPane)
      return;

    const dbLayerOstore = 'appObjStoreNotes.js';
    storageSearch(STO_DATA, dbLayerOstore).then(async x => {
      await appendJavaScript(dbLayerOstore, x, document.head);
      TI.db = new HelpViewerDB();
      await TI.db.getDb();
    });

    const h_EVT_UN_SETNOTESVISIBILITY = (data) => {
      const current = !!getUserConfigValue(TI.cfgCFGKEYNOTESVISIBLE);
      TI._setNotesVisibility(current);
    };

    TI.eventDefinitions.push([T.EVT_UN_SETNOTESVISIBILITY, IEvent, h_EVT_UN_SETNOTESVISIBILITY]);

    TI.cfgNOTESTYPEDFILTEROUTHTML = TI.cfgNOTESTYPEDFILTEROUTHTML?.split(';');
    TI.cfgCAPTIONNOTESVISIBLE = [...TI.cfgCAPTIONNOTESVISIBLE];
    const firstCaption = TI.cfgCAPTIONNOTESVISIBLE.shift();
    TI.cfgCAPTIONNOTESVISIBLE = [firstCaption, TI.cfgCAPTIONNOTESVISIBLE.join('')];

    super.init();

    if (TI.cfgNOTESONLYTEXTCLIPBOARD) {
      TI.NOTE_PASTE = new SystemEventHandler('', undefined, contentPane, 'paste', (e) => TI._handleForNote(e, TI._handlePaste.bind(TI)));
      TI.NOTE_PASTE.init();  
    }

    TI.NOTE_BLUR = new SystemEventHandler('', undefined, contentPane, 'focusout', (e) => TI._handleForNote(e, TI._handleBlur.bind(TI)));
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

  async _handleBlur(e) {
    const targetVal = stripTagsSome(e.target.innerHTML, this.cfgNOTESTYPEDFILTEROUTHTML);

    if (this.cfgNOTESONLYTEXTMANTYPED)
      e.target.innerText = stripTags(targetVal);
    else
      e.target.innerHTML = targetVal;

    const targetId = e.target.id;
    var noteId = parseInt(targetId.split('-')[1]);

    if (!targetVal) {
      if (!targetId.includes('_')) {
        this.db.deleteNote(noteId);
      }
      e.target.remove();
    } else {
      const contentPane = $(this.cfgIDCONTENT);
      const elements = [...$A('*', contentPane)].filter(x => !x.classList.contains(this.cfgCSSCLASS) || x.id == targetId);
      const noteObject = { data: e.target.innerHTML, position: elements.indexOf(e.target), chapterId: this.chapterId };

      if (targetId.includes('_')) {
        noteId = await this.db.addNote(noteObject);
        e.target.id = `${this.cfgCSSCLASS}-${noteId}`;
      } else {
        this.db.updateNote(noteId, noteObject);
      }
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
        sendEvent(evtHideIfTooWide);
      }
    };

    TI.btnNoteAdd = uiAddButton('notes-add', TI.cfgEDITCAPTION, TI.aliasName, handlerAddNote);

    const handlerVisibleNotes = (e) => {
      const nextB = getUserConfigValue(TI.cfgCFGKEYNOTESVISIBLE) == 0;
      const next = Number(nextB);
      setUserConfigValue(TI.cfgCFGKEYNOTESVISIBLE, next);
      e.target.innerHTML = TI.cfgCAPTIONNOTESVISIBLE[next];
      TI._setNotesVisibility(nextB);
    };

    const currentVisibility = Number(getUserConfigValue(TI.cfgCFGKEYNOTESVISIBLE) != 0);
    TI.btnNoteVisibility = uiAddButton('notes-visible', TI.cfgCAPTIONNOTESVISIBLE[currentVisibility], TI.aliasName, handlerVisibleNotes);

    const handlerExport = async (e) => {
      const chapters = await TI.db.getChaptersByHelpFile(TI.db.helpFileIdx);
      const notes = (await Promise.all(chapters.map(x => TI.db.getNotesByChapter(x.id)))).flat();
      const reply = {
        chapters: chapters.map(x => {
          return {i: x.id, n: x.name};
        }),
        notes: notes.map(x => {
          return {c: x.chapterId, p: x.position, d: x.data};
        })
      };

      const replyPlain = JSON.stringify(reply);
      prepareDownload(stringToBlob(replyPlain, 'application/json'), `notes-${TI.prjName.replace('/', '-')}-${getDateInYYYYMMDD(new Date())}.json`);
    };

    TI.btnExport = uiAddButton('notes-export', '💾', TI.aliasName, handlerExport);

    const handlerClear = async (e) => {
      if (!confirm(_T('notesQuestion')))
        return;

      const chapters = await TI.db.getChaptersByHelpFile(TI.db.helpFileIdx);
      const notes = [...new Set( (await Promise.all(chapters.map(x => TI.db.getNotesByChapter(x.id)))).flat().map(x => x.id) )];
      notes.forEach(x => TI.db.delete('note', x));
    };

    TI.btnExport = uiAddButton('notes-clear', '🗑️', TI.aliasName, handlerClear);

  }

  _setNotesVisibility(state) {
    $A('.' + this.cfgCSSCLASS, $(this.cfgIDCONTENT)).forEach(x => state ? x.classList.remove(C_HIDDENC) : x.classList.add(C_HIDDENC));
    this.notesVisibility = state;
  }

  async onET_ConfigFileReloadFinished(evt) {
    if (evt.id != FILE_CONFIG)
      return;
    const prjName = configGetValue('CFG_KEY__PRJNAME', '')?.trim() || dataPathGeneral;
    const TI = this;
    TI.prjName = prjName;
    TI.db.helpFileIdx = await TI.db.getHelpIdByName(prjName) || await TI.db.addHelpFile({ name: prjName });
  }

  onETButtonSend(x) {
    this.handlerButtonSend(x);
  }

  async onET_ChapterShown(evt) {
    this.pagePath = evt.addressOrig;
    
    if (!this.db || evt.id != '')
      return;

    const contentPane = $(this.cfgIDCONTENT);
    const elements = [...$A('*', contentPane)];
    const cssClassUNote = this.cfgCSSCLASS;

    const chapterId = await this.db.getChapterIdByName(this.pagePath, this.db.helpFileIdx) || await this.db.addChapter({ name: this.pagePath, helpId: this.db.helpFileIdx });
    this.chapterId = chapterId;
    const notesData = await this.db.getNotesByChapter(chapterId);
    var notesDataTransposed = notesData.map(x => [elements[x.position-1], x.id, x.data]);

    notesDataTransposed = notesDataTransposed.map(x => {
      const span = this._getNewNoteSpan();
      span.id = `${cssClassUNote}-${x[1]}`;
      span.innerHTML = x[2];
      return [x[0], span];
    });

    const currentVisibility = getUserConfigValue(this.cfgCFGKEYNOTESVISIBLE) == 1;

    notesDataTransposed.forEach(x => {
      if (x[0].parentNode.tagName.toUpperCase().startsWith('H'))
        x[0] = x[0].parentNode;
      x[0].after(x[1]);
    });

    this._setNotesVisibility(currentVisibility);
  }

  _getNewNoteSpan() {
    const newSpan = document.createElement('span');
    const cssClassUNote = this.cfgCSSCLASS;

    newSpan.classList.add(cssClassUNote);
    newSpan.innerHTML = ``;
    newSpan.setAttribute('contenteditable', 'true');
    newSpan.setAttribute('role', 'textbox');
    newSpan.setAttribute('aria-multiline', 'true');
    return newSpan;
  }

  onETActionClickedEvent(evt) {
    var target = evt.target;
    const contentPane = target.closest('#' + this.cfgIDCONTENT);
    if (!evt.event.isTrusted || !target || !contentPane || target.matches('a') || !target.innerText)
      return;
    const newSpan = this._getNewNoteSpan();
    const cssClassUNote = this.cfgCSSCLASS;

    newSpan.id = cssClassUNote + '_';

    var idx = 1;
    var nextID = `${newSpan.id}${idx}`;

    while($(nextID)) {
      idx++;
      nextID = `${newSpan.id}${idx}`;
    }

    newSpan.id = nextID;
    
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
