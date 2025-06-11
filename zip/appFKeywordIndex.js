/*S: Feature: Keyword index handling */
// User defined word dictionary
const FILENAME_KEYWORDS = 'keywords.lst';
const FILENAME_KWTOFILES = 'files-keywords.lst';

const PANE_KEYWORDS_ID = 'keywordList';

const KLIST_NAME = 'kwds';

// Fulltext search index

const FILENAME_FTS_KEYWORDS = 'fts-keywords.lst';
const FILENAME_FTS_KWTOFILES = 'fts-files-keywords.lst';

const PANE_FTS_KEYWORDS_ID = 'fulltextList';
const KLIST_FTS_NAME = 'fts';

const keywordLists = new Map();

var pathHeadingAlias;

function newKeywordDatabase(id = KLIST_NAME, keywordData, keywordToFilesData) {
  var keywordOriginal;
  var keywordSorted;
  var keywordFiles;

  async function readKeywordDatabase() {
    keywordFiles = new Map();
    if (!pathHeadingAlias)
      pathHeadingAlias = new Map();
    var archContent = keywordData;
    
    if (!archContent)
      return false;
    
    keywordOriginal = archContent.replace(/\r\n/g, "\n").split("\n");
    
    for (const kw of keywordOriginal) {
      if (!keywordFiles.has(kw))
        keywordFiles.set(kw, new Set());
    }
    
    archContent = keywordToFilesData;
    const kwToFilesData = archContent.replace(/\r\n/g, "\n").split("\n");
  
    if (!archContent)
      return null;
  
    for (const kwf of kwToFilesData) {
      const parts = kwf.split("|", 3);
      const doc = parts[0]?.trim() || "";
      const alias = parts[1]?.trim() || "";
      const kwds = parts[2]?.trim().split(";") || [];
      if (!pathHeadingAlias.get(doc))
        pathHeadingAlias.set(doc, alias);
      
      for (const kwi of kwds) {
        const keyw = keywordOriginal[kwi];
        keywordFiles.get(keyw).add(doc);
      }
    }
    
    keywordSorted = [];
      
    for (const kw of keywordOriginal) {
      const parts = kw.split(';');
      const docs = keywordFiles.get(kw) || [];
      keywordFiles.delete(kw);
    
      for (const part of parts) {
        keywordSorted.push(part);
    
        const existingDocs = keywordFiles.get(part) || [];
        const mergedDocs = Array.from(new Set([...existingDocs, ...docs]));
    
        keywordFiles.set(part, mergedDocs);
      }
    }
    
    keywordSorted = [...new Set(keywordSorted)];
    keywordSorted.sort((a, b) => a.localeCompare(b));
    
    const treeData = keywordSorted
      .map((item, i) => `${item}|||@${item}:${id}`)
      .join('\n');
  
    return treeData;
  }
  
  function searchKeyword(id, target) {
    const files = keywordFiles.get(id) || new Set();
    
    var treeData = `${id}|||\n`;
    for (const item of files) {
      var targetkwName = pathHeadingAlias.get(item) || item;
      treeData += ` ${targetkwName}|||${item}\n`
    }
    
    target.innerHTML = linesToHtmlTree(treeData);
    openSubtree(target);
  }
  
  return {
    readKeywordDatabase,
    searchKeyword
  }
}

function searchKeywordE(event, id, klist) {
  event.preventDefault();
  keywordLists.get(klist)?.searchKeyword(id, event.currentTarget.parentElement);
}
/*E: Feature: Keyword index handling */