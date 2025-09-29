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
  content: ${bookClosed};
  }
  
  ul.tree details[open] > summary::before {
  transform: rotate(0deg);
  content: ${bookOpen};
  }` 
      );
    }

    var siblingTxt = configGetValue(TI.cfgCFGKEYOverrideBookIconSibling) || '';

    if (siblingImg) {
      siblingTxt = '';
      siblingImg = 
`width: 16px;
height: 16px;
background-image: url("${siblingImg}");
background-size: contain;
background-repeat: no-repeat;`;
    } else {
      siblingImg = '';
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

  }
}

Plugins.catalogize(puiTOCCustomIcons);
