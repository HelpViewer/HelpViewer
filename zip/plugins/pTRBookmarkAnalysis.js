class BmarksChanged extends IEvent {
  constructor() {
    super();
    this.data = '';
  }
}

class pTRBookmarkAnalysis extends pTRPhasePlugin {
  static EVT_BMARKA_BMARKS_CHANGED = BmarksChanged.name;
  
  init() {
    const T = this.constructor;
    const TI = this;

    TI.eventDefinitions.push([T.EVT_BMARKA_BMARKS_CHANGED, BmarksChanged, null]); // outside event handlers
    super.init();
  }
  
  onETShowChapterResolutions(r) {
    const C_ANCHOR_CONTENT = ' #';
    // append bookmarks to chapters
    const headings = $A('h1, h2, h3, h4, h5, h6', r.doc);
    const counters = [0, 0, 0, 0, 0, 0];

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));

      if (!heading.id) {
        heading.id = nameForAnchor(heading.textContent, level, counters[level-1]++);
      }
      
      const anchor = r.doc.createElement('a');
      anchor.href = `#${heading.id}`;
      anchor.className = 'anchor-link';
      anchor.textContent = C_ANCHOR_CONTENT;
      
      heading.appendChild(anchor);
    });

    const bookmarksFound = Array.from($A('a', r.doc));
    var treeString = '';

    if (bookmarksFound.length > 0) {
      bookmarksFound.forEach(a => {
        if (!/^H[1-6]$/.test(a.parentElement.tagName)) return;
        treeString += ' '.repeat(parseInt(a.parentElement.tagName.slice(1, 2), 10) - 1);
        treeString += a.parentElement.innerText.slice(0, -C_ANCHOR_CONTENT.length);
        treeString += '|||';
        treeString += a.getAttribute('href');
        treeString += '\n';
      });
      
      if (treeString.slice(0, 1) === ' ')
        treeString = r.heading + '|||\n' + treeString;
  
      treeString = treeString.trim();  
    }

    if (treeString.length == 0) 
      treeString = undefined;

    sendEvent(this.constructor.EVT_BMARKA_BMARKS_CHANGED, (r) => r.data = treeString);
  }
}

Plugins.catalogize(pTRBookmarkAnalysis);
