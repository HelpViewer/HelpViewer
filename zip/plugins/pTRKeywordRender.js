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
      r.tokens.push(r.TOKEN_NOLOADDATA);

      const splits = r.uri.split(":");
      if (splits.length <= 1) {
        r.content = "";
      } else {
        const word = splits[0].substring(1);
        r.heading = word;
        const dictionary = splits[1];
        const collector = document.createElement('ul');
        collector.className = 'tree';
        
        var foundKeywordLinks = getIndexFileKeywordData(dictionary, word);
        foundKeywordLinks = foundKeywordLinks.substring(foundKeywordLinks.indexOf("\n") + 1);

        var dict = getIndexFileData(dictionary, word, undefined) + '\n';
        var dictThisIdx = dict.indexOf("\n") + 1;

        if (dict.substring(0, dictThisIdx).startsWith(`${word}|`))
          dict = dict.substring(dictThisIdx);

        dict = (foundKeywordLinks + dict).trim().split('\n').map(line => line.trim()).join('\n');
        collector.innerHTML = linesToHtmlTree(dict, "tr-ContentPage");
  
        r.content = collector.outerHTML ? collector.outerHTML : ' ';
      }
    }
  }
}

Plugins.catalogize(pTRKeywordRender);
