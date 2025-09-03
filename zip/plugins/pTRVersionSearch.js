class pTRVersionSearch extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    const TI = this;

    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.ConfigFileGet);
    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.GetHomePageData);
    TI.catalogizeEventCall(TI.onETShowChapterResolutions, EventNames.GET_ACTIVE_LANGUAGE);

    super.init();
  }

  deInit() {
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    const C_ANCHOR_CONTENT = ' #';
    const FILENAME_CHANGELOG = 'CHANGELOG.md';

    if (r.uri != `~${FILENAME_CHANGELOG}`)
      return;

    r.heading = _T('versionList');
    const headings = $A('h2', r.doc);
    
    const PRJNAME_VAL = configGetValue(CFG_KEY__PRJNAME)?.trim().split('/');
    
    headings.forEach(heading => {
      const boomark = $O('a', heading);
      const verId = heading.textContent.replace(C_ANCHOR_CONTENT, '');
      
      if (isNaN(Number(verId.substring(0,8)))) 
        return;

      heading.textContent = '';
      const uriZIP = getHelpRepoUriReleaseZip(PRJNAME_VAL[0], PRJNAME_VAL[1], verId);
      const targURI = `?${PAR_NAME_DOC}=${uriZIP}&${PAR_NAME_PAGE}=${getGets(PAR_NAME_PAGE) || getHomePageData() || FILENAME_1STTOPIC}`;
      const link = document.createElement('a');

      link.href = targURI;
      link.textContent = verId;
      heading.appendChild(link);

      const linkDownload = document.createElement('a');
      linkDownload.href = uriZIP.replace('__', getActiveLanguage());
      linkDownload.innerText = '📥';

      heading.appendChild(linkDownload);
      heading.appendChild(boomark);
    });

  }
}

Plugins.catalogize(pTRVersionSearch);
