class pKWGetChapterLinks extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  init() {
    super.init();
  }

  deInit() {
    super.deInit();
  }

  onETShowChapterResolutions(r) {
    const nodes = $A('a', r.doc);
    var links = [];

    if (nodes && nodes.length > 0)
    {
      links = [...nodes].reduce((acc, o) => {
        //const href = o.getAttribute('href');
        const href = o.getAttribute('data-param');
        //const pageStr = (new URLSearchParams(href).get(PAR_NAME_PAGE) || href).split('#')[0];
        var pageStr = (new URLSearchParams(href).get(PAR_NAME_PAGE) || href);

        if (pageStr)
          pageStr = pageStr.split('#')[0];
        
        const val = [pageStr, o.innerText];
  
        if (val[0] && !(/^(ftp|http|\?d=|=)/.test(val[0])))
          acc.push(val);
  
        return acc;
      }, []);
  
    }

    r.content = [r.content, links];
  }
}

Plugins.catalogize(pKWGetChapterLinks);
