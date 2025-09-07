class pTRKeywordInText extends pTRPhasePlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }
  
  onETShowChapterResolutions(r) {
    const stripDiacritics = textCleanupPhrase;

    const keywordToShow = stripDiacritics(r.addData.get('KW'));

    if (keywordToShow && keywordToShow.length > 0) {
      r.result = r.result.then(() => {
        const securedKeyword = stripDiacritics(keywordToShow).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(securedKeyword, 'gi');
    
        searchOverTextNodesAndDo(r.doc, (parent) => {
          const matches = Array.from(stripDiacritics(parent.nodeValue).matchAll(regex));

          for (const m of matches) {
            const span = document.createElement('span');
            const start = m.index;
            const end = start + m[0].length;
            const found = parent.nodeValue.substring(start, end);
            const foundR = new RegExp(found.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            span.innerHTML = parent.nodeValue.replace(foundR, `<span class='wordFound'>${found}</span>`);
            parent.replaceWith(...span.childNodes);
          }
        });
  
      });
  
    }


  }
}

Plugins.catalogize(pTRKeywordInText);
