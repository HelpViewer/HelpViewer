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
    const keywordToShow = r.addData.get('KW');

    const stripDiacritics = function stripDiacritics(str) {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    if (keywordToShow && keywordToShow.length > 0) {
      r.result = r.result.then(() => {
        const securedKeyword = stripDiacritics(keywordToShow).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(securedKeyword, 'gi');
    
        searchOverTextNodesAndDo(r.doc, (parent) => {
          const match = stripDiacritics(parent.nodeValue).match(regex);
          if (match) {
            const span = document.createElement('span');
            span.innerHTML = parent.nodeValue.replace(regex, (m) =>
              `<span class='wordFound'>${m}</span>`
            );
            parent.replaceWith(...span.childNodes);
          }
        });
  
      });
  
    }


  }
}

Plugins.catalogize(pTRKeywordInText);
