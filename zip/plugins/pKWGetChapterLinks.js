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
    const links = [...$A('a', r.doc)].reduce((acc, o) => {
      const href = o.getAttribute('href');
      const pageStr = (new URLSearchParams(href).get(PAR_NAME_PAGE) || href).split('#')[0];
      log('E RRRR', pageStr);
      const val = [pageStr, o.innerText];

      if (val[0] && !(/^(ftp|http|\?d=|=)/.test(val[0])))
        acc.push(val);

      return acc;
    }, []);

    r.content = [r.content, links];
  }
}

Plugins.catalogize(pKWGetChapterLinks);
