class IndexFileSetData extends IEvent {
  constructor() {
    super();
    this.mapping = undefined;
    this.keywords = undefined;
  }
}

class IndexFileGetData extends IEvent {
  constructor() {
    super();
    this.key = undefined;
    this.cap = 100;
  }
}

class IndexFileGetKeywordData extends IEvent {
  constructor() {
    super();
    this.key = undefined;
  }
}

class pIndexFile extends IPlugin {
  static EVT_IF_SET = IndexFileSetData.name;
  static EVT_IF_GET = IndexFileGetData.name;
  static EVT_IF_GETKDW = IndexFileGetKeywordData.name;
  static EVT_IF_LOADED = 'IndexFileLoaded';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;
  }

  init() {
    const T = this.constructor;
    const TI = this;
    
    var index;
    const aliasName = this.aliasName;

    const h_EVT_IF_SET = (data) => {
      index = newKeywordDatabase(aliasName, data.keywords.toLowerCase(), data.mapping);
      data.result = index.readKeywordDatabase();

      sendEvent(T.EVT_IF_LOADED, (r) => {
        r.id = aliasName;
        r.result = data.result > 0;
      });
    }
    TI.eventDefinitions.push([T.EVT_IF_SET, IndexFileSetData, h_EVT_IF_SET.bind(this)]);

    const h_EVT_IF_GET = (data) => {
      //if (data.id != this.aliasName) return;
      data.result = index.getTreeData(data.key, data.cap);
    }
    TI.eventDefinitions.push([T.EVT_IF_GET, IndexFileGetData, h_EVT_IF_GET.bind(this)]);

    const h_EVT_IF_GETKDW = (data) => {
      //if (data.id != this.aliasName) return;
      data.result = index.searchKeyword(data.key);
    }
    TI.eventDefinitions.push([T.EVT_IF_GETKDW, IndexFileGetKeywordData, h_EVT_IF_GETKDW.bind(this)]);

    TI.eventDefinitions.push([T.EVT_IF_LOADED, IEvent, null]); // outside event handlers
    
    super.init();
  }

  deInit() {
    super.deInit();
  }
}

Plugins.catalogize(pIndexFile);

function newKeywordDatabase(id, keywordData, keywordToFilesData) {
  var keywordSorted;
  var keywordFiles;
  var keywordToIndex;
  
  function readKeywordDatabase() {
    var archContent = keywordData;

    if (!archContent)
      return false;
    
    var keywordOriginal = rowsToArray(archContent);
    
    keywordToIndex = new Map();
    keywordOriginal.forEach((line, index) => {
      if (line.trim()) {
        const word = keywordToIndex.get(line);

        if (word) {
          keywordToIndex.set(line, `${word};${index}`);
        } else {
          keywordToIndex.set(line, index);
        }
      }
    });
    
    archContent = keywordToFilesData;
    const kwToFilesData = rowsToArray(archContent);
  
    if (!archContent)
      return null;
  
    keywordFiles = kwToFilesData.map(kwf => kwf.split(";"));
    
    var keywordsDivided = new Map();
    
    for (var i = 0; i < keywordOriginal.length; i++) {
      const kw = keywordOriginal[i];
      const parts = kw.split(';');
      
      if (parts.length > 1) {
        keywordToIndex.delete(kw);
        for (const part of parts) {
          if (!keywordsDivided.has(part))
            keywordsDivided.set(part, []);
          keywordsDivided.get(part).push(i);
        }
      }
    }
    
    for (const [key, value] of keywordsDivided) {
      if (value.length == 1) {
        keywordToIndex.set(key, value[0]);
      } else {
        const joined = value.flatMap(kwf => keywordFiles[kwf]);
        keywordFiles.push(joined);
        keywordToIndex.set(key, keywordFiles.length - 1);
      }
    }
    
    keywordSorted = [...new Set(keywordToIndex.keys())];
    keywordSorted.sort((a, b) => a.localeCompare(b));

    return keywordSorted.length;
  }
  
  function getTreeData(phrase, cap = 100) {
    var treeData = [];
    
    if (!phrase) {
      treeData = keywordSorted;
    } else {
      treeData = keywordSorted.filter(word => word.includes(phrase));
    }
    
    if (!treeData) return "";

    if (typeof cap === 'number' && !isNaN(cap) && cap > 0)
      treeData = treeData.slice(0, cap);
    
    treeData = treeData
      .map((item, i) => `${item}|||@${item}:${id}`)
      .join('\n');
    
    return treeData;
  }
  
  function searchKeyword(id) {
    const fileLists = String(keywordToIndex.get(id))?.split(';');
    var files = fileLists.flatMap(k => keywordFiles[k] || []);
    files = [...new Set(files)];
    
    var treeData = `${id}|||\n`;
    for (const item of files) {
      var targetkwName = getChapterAlternativeHeading(item);
      var targetkwPath = targetkwName[0];
      targetkwName = targetkwName[1];
      if (!['http', 'https', 'ftp', ':', '='].some(proto => targetkwPath.startsWith(proto))) {
        treeData += ` ${targetkwName}|||${targetkwPath}${MARKER_MARKWORD}${id}\n`
      } else {
        treeData += ` ${targetkwName}|||${targetkwPath}\n`
      }
    }
    return treeData;
  }
  
  return {
    readKeywordDatabase,
    searchKeyword,
    getTreeData
  }
}
