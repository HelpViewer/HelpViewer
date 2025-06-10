/*S: Feature: Keyword index handling */
const FILENAME_KEYWORDS = 'keywords.lst';
const FILENAME_KWTOFILES = 'files-keywords.lst';

const PANE_KEYWORDS_ID = 'keywordList';

var keywordOriginal;
var keywordSorted;
var keywordFiles;
var pathHeadingAlias;

async function readKeywordDatabase(arch, paneId = PANE_KEYWORDS_ID) {
  keywordFiles = new Map();
  pathHeadingAlias = new Map();
  var archContent = (await searchArchiveForFile(FILENAME_KEYWORDS, arch));
  
  if (!archContent)
    return false;
  
  keywordOriginal = archContent.replace(/\r\n/g, "\n").split("\n");
  
  for (const kw of keywordOriginal) {
    if (!keywordFiles.has(kw))
      keywordFiles.set(kw, new Set());
  }
  
  archContent = (await searchArchiveForFile(FILENAME_KWTOFILES, arch));
  const kwToFilesData = archContent.replace(/\r\n/g, "\n").split("\n");

  if (!archContent)
    return null;

  for (const kwf of kwToFilesData) {
    const parts = kwf.split("|", 3);
    const doc = parts[0]?.trim() || "";
    const alias = parts[1]?.trim() || "";
    const kwds = parts[2]?.trim().split(";") || [];
    pathHeadingAlias.set(doc, alias);
    
    for (const kwi of kwds) {
      const keyw = keywordOriginal[kwi];
      keywordFiles.get(keyw).add(doc);
    }
  }
  
  keywordSorted = new Array();
  keywordsToDismantle = new Array();
    
  for (const kw of keywordOriginal) {
    const parts = kw.split(';');
    const base = parts[0];
    for (const kwM of parts) {
      keywordSorted.push(kwM);
    }
    
    if (parts.length > 1) {
      const docs = keywordFiles.get(kw);
      delete(keywordFiles[kw]);
      for (const kwM of parts) {
        keywordFiles.set(kwM, docs);
      }
    }
  }
  
  keywordSorted.sort((a, b) => a.localeCompare(b));
  
  const treeData = keywordSorted
    .map((item, i) => `${item}|||@${item}:${paneId}`)
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

function searchKeywordE(event, id) {
  event.preventDefault();
  searchKeyword(id, event.currentTarget.parentElement);
}

/*E: Feature: Keyword index handling */