class puiTOCCustomIcons extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);

    const TI = this;
    TI.eventIdStrict = true;

    TI.DEFAULT_KEY_CFG_FILENAMEBOOKO = FILENAME_BOOKO;
    TI.DEFAULT_KEY_CFG_FILENAMEBOOKC = FILENAME_BOOKC;
    TI.DEFAULT_KEY_CFG_FILENAMESIBLING = FILENAME_SIBLING;
    TI.DEFAULT_KEY_CFG_BASESTORE = STO_HELP;
    TI.DEFAULT_KEY_CFG_CFGKEYOverrideBookIconOpened = CFG_KEY_OverrideBookIconOpened;
    TI.DEFAULT_KEY_CFG_CFGKEYOverrideBookIconClosed = CFG_KEY_OverrideBookIconClosed;
    TI.DEFAULT_KEY_CFG_CFGKEYOverrideBookIconSibling = CFG_KEY_OverrideBookIconSibling;
    TI.DEFAULT_KEY_CFG_SIBLINGSICONSWITCH = 'tree';
  }

  deInit() {
    $('overridePlusMinus')?.remove();
    $('overrideSiblingTopics')?.remove();
    $('overridePlusMinusVars')?.remove();
    super.deInit();
  }

  async onETConfigFileReloadFinished(d) {
    const TI = this;
    const stor = TI.cfgBASESTORE;

    // override book images in tree structure
    var [bookOpen, bookClosed, siblingImg] = await Promise.all([
      getDataOfPathInZIPImage(TI.cfgFILENAMEBOOKO, stor),
      getDataOfPathInZIPImage(TI.cfgFILENAMEBOOKC, stor),
      getDataOfPathInZIPImage(TI.cfgFILENAMESIBLING, stor),
    ]);

    TI.images = [bookOpen, bookClosed, siblingImg];
    let siblingImgOrig = siblingImg;
  
    var doOverride = null;
    
    if (bookOpen && bookClosed) {
      bookOpen = `url("${bookOpen}")`;
      bookClosed = `url("${bookClosed}")`;
      doOverride = 1;
    } else {
      bookOpen = configGetValue(TI.cfgCFGKEYOverrideBookIconOpened);
      bookClosed = configGetValue(TI.cfgCFGKEYOverrideBookIconClosed);
      
      if (bookOpen && bookClosed) {
        const icon = document.createElement('span');
        icon.innerHTML = bookOpen;
        bookOpen = icon.innerHTML;
        icon.innerHTML = bookClosed;
        bookClosed = icon.innerHTML;
        bookOpen = `"${bookOpen}"`;
        bookClosed = `"${bookClosed}"`;
        doOverride = 1;
      }
    }
    
    if (doOverride) {
      const cssName = 'overridePlusMinus';
      $(cssName)?.remove();
      appendCSS(cssName,
  `ul.tree details > summary::before {
  content: var(--icon-book-closed);
  }
  
  ul.tree details[open] > summary::before {
  transform: rotate(0deg);
  content: var(--icon-book-open);
  }` 
      );
    }

    var siblingTxt = configGetValue(TI.cfgCFGKEYOverrideBookIconSibling) || '';

    if (siblingImg) {
      siblingTxt = '';
      siblingImg = 
`width: 16px;
height: 16px;
background-image: var(--icon-tree-sibling);
background-size: contain;
background-repeat: no-repeat;`;
    } else {
      siblingImg = '';
      siblingImgOrig = '';
    }

    const cssName = 'overrideSiblingTopics';
    $(cssName)?.remove();
    if (siblingTxt || siblingImg) {
      const siblingIconSwitch = TI.cfgSIBLINGSICONSWITCH ? `#${TI.cfgSIBLINGSICONSWITCH}` : '';
      appendCSS(cssName,
`.tree${siblingIconSwitch} li > a::before {
content: "${siblingTxt}";
${siblingImg}
display: inline-block;
margin-right: 0.5em;
vertical-align: middle;
}`);
    }

    const varsCSS ='overridePlusMinusVars';
    $(varsCSS)?.remove();
    appendCSS(varsCSS,
`:root { 
  --icon-book-closed: ${bookClosed || '""'};
  --icon-book-open: ${bookOpen || '""'};
  --icon-tree-sibling: url("${siblingImgOrig}");
}`);
  }

  onET_OfflineDump(evt) {
    const T = this;
    const kFILES = '_FILES';
    if (!evt.collected.has(kFILES))
      evt.collected.set(kFILES, new Map());
    const target = evt.collected.get(kFILES);

    if (T.images[0])
      target.set(T.cfgFILENAMEBOOKO, T.images[0]);
    if (T.images[1])
      target.set(T.cfgFILENAMEBOOKC, T.images[1]);
    if (T.images[2])
      target.set(T.cfgFILENAMESIBLING, T.images[2]);

    return target;
  }
}

Plugins.catalogize(puiTOCCustomIcons);
