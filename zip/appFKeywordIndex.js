/*S: Feature: Keyword index handling */
// User defined word dictionary
const FILENAME_FILES = 'files.lst';
const FILENAME_KEYWORDS = 'keywords.lst';
const FILENAME_KWTOFILES = 'keywords-files.lst';

const PANE_KEYWORDS_ID = 'keywordList';

const KLIST_NAME = 'keywordList';

// Fulltext search index

const FILENAME_FTS_KEYWORDS = 'fts-keywords.lst';
const FILENAME_FTS_KWTOFILES = 'fts-keywords-files.lst';

const PANE_FTS_KEYWORDS_ID = 'fulltextList';
const KLIST_FTS_NAME = 'fulltextList';

const keywordLists = new Map();

var pathHeadingAlias = new Map();
var idxPath = [];

async function getDocumentHeadingTable(data) {
  const transformed = data.replace(/\r\n/g, "\n").split("\n");
  
  pathHeadingAlias = new Map();
  idxPath = [];
  
  for (const kw of transformed) {
    const [path, title] = kw.split("|");
    idxPath.push(path || '');
    pathHeadingAlias.set(path, title || path || '');
  }
}

function newKeywordDatabase(id = KLIST_NAME, keywordData, keywordToFilesData) {
  var keywordOriginal;
  var keywordSorted;
  var keywordFiles;
  var keywordToIndex;
  
  async function readKeywordDatabase() {
    var archContent = keywordData;
    
    if (!archContent)
      return false;
    
    keywordOriginal = archContent.replace(/\r\n/g, "\n").split("\n");
    
    keywordToIndex = new Map();
    keywordOriginal.forEach((line, index) => {
      if (line.trim()) {
        keywordToIndex.set(line, index);
      }
    });
    
    archContent = keywordToFilesData;
    const kwToFilesData = archContent.replace(/\r\n/g, "\n").split("\n");
  
    if (!archContent)
      return null;
  
    keywordFiles = kwToFilesData.map(kwf => kwf.split(";"));
    
    keywordsDivided = new Map();
    
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
  }
  
  function getTreeData(phrase, cap = 100) {
    var treeData = [];
    
    if (!phrase) {
      treeData = keywordSorted
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
  
  function searchKeyword(id, target) {
    const files = keywordFiles[keywordToIndex.get(id)] || [];
    
    var treeData = `${id}|||\n`;
    for (const item of files) {
      var targetkwName = pathHeadingAlias.get(idxPath[item]) || idxPath[item];
      treeData += ` ${targetkwName}|||${idxPath[item]}\n`
    }
    
    target.innerHTML = linesToHtmlTree(treeData, "kwdf-");
    openSubtree(target);
  }
  
  return {
    readKeywordDatabase,
    searchKeyword,
    getTreeData
  }
}

function searchKeywordE(parentO, id, klist) {
  keywordLists.get(klist)?.searchKeyword(id, parentO);
}
/*E: Feature: Keyword index handling */