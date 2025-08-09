class pTRUnconnectedTransformation extends pTRPhasePlugin {
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

    //relative link paths update for ZIP structure
    const checkList = ["href", "src", "data-href"];

    $A('*', r.doc).forEach((el) => {
      checkList.forEach((attr) => {
        if (el.hasAttribute(attr)) {
          const val = el.getAttribute(attr);
          if (val 
            && el.tagName.toLowerCase() !== "img"
            && !/^https?:\/\//.test(val) 
            && !val.startsWith("mailto:") 
            && !val.startsWith("tel:") 
            && !val.startsWith("?") 
            && !val.startsWith("#")) {
            
            const newVal = convertRelativePathToViewerURI(val);
            el.setAttribute(attr, newVal);
          }
        }
      });
    });

  }
}

Plugins.catalogize(pTRUnconnectedTransformation);
