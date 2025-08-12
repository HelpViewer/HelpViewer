class pTRKeywordInText extends pTRPhasePlugin {
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
    r.result = this.doneVal;
    const keywordToShow = r.addData.get('KW');

    if (keywordToShow && keywordToShow.length > 0) {
      const securedKeyword = keywordToShow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(securedKeyword, 'gi');
  
      searchOverTextNodesAndDo(r.doc, (parent) => {
        const match = parent.nodeValue.match(regex);
        if (match) {
          const span = document.createElement('span');
          span.innerHTML = parent.nodeValue.replace(regex, (m) =>
            `<span class='wordFound'>${m}</span>`
          );
          parent.replaceWith(...span.childNodes);
        }
      });
  
    }

  }
}

Plugins.catalogize(pTRKeywordInText);
