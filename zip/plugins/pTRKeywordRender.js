class pTRKeywordRender extends pTRPhasePlugin {
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
    if (r.uri?.startsWith("@")) {
      const splits = r.uri.split(":");
      if (splits.length <= 1) {
        r.content = "";
      } else {
        const word = splits[0].substring(1);
        SetHeaderText(word);
        const dictionary = splits[1];
        const collector = document.createElement('ul');
        collector.className = 'tree';
        
        var foundKeywords = getIndexFileKeywordData(dictionary, word);
        const kwFound = foundKeywords.split("\n").length;
        const collector2 = document.createElement('ul');
        collector2.className = 'tree';
  
        if (foundKeywords !== "" && kwFound > 1)
          collector2.innerHTML = linesToHtmlTree(foundKeywords, "tr-ContentPage");
  
        collector.innerHTML = linesToHtmlTree(getIndexFileData(word, dictionary), dictionary);
        const firstDetails = $A('li', $O('ul', $O('details', collector)));
  
        if (firstDetails) {
          firstDetails.className = 'tree';
          firstDetails.forEach(li => collector2.appendChild(li));
        } else {
          collector.innerHTML = "";
        }
  
        if (collector2.innerHTML) {
          const collector3 = document.createElement('ul');
          collector3.className = 'tree';
          collector3.innerHTML = collector2.innerHTML;
          collector.innerHTML = "";
          collector.appendChild(collector3);
        }
  
        r.content = collector.innerHTML ? collector.innerHTML : ' ';
        r.result = Promise.resolve();
      }
    } else {
      r.result = r.getStorageData(r.uri).then((x) => {
        r.content = x;
      });  
    }
  }
}

Plugins.catalogize(pTRKeywordRender);
