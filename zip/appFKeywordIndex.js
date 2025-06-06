/*S: Feature: Keyword index handling */
const FILENAME_KEYWORDS = 'keywords.lst';
const FILENAME_KWTOFILES = 'files-keywords.lst';

const keywordsPane = document.getElementById('keywordList');

var keywordOriginal;
var keywordSorted;
var keywordFiles;
var pathHeadingAlias;

async function ReadKeywordDatabase(arch) {
  keywordFiles = new Map();
  pathHeadingAlias = new Map();
  
  keywordOriginal = (await searchArchiveForFile(FILENAME_KEYWORDS, arch)).replace(/\r\n/g, "\n").split("\n");
  keywordSorted = [...keywordOriginal];
  keywordSorted.sort((a, b) => a.localeCompare(b));
  
  for (const kw of keywordOriginal) {
    if (!keywordFiles.has(kw))
      keywordFiles.set(kw, new Set());
  }
  const kwToFilesData = (await searchArchiveForFile(FILENAME_KWTOFILES, arch)).replace(/\r\n/g, "\n").split("\n");

  for (const kwf of kwToFilesData) {
    const parts = kwf.split("|", 3);
    const doc = parts[0]?.trim() || "";
    const alias = parts[1]?.trim() || "";
    const kwds = parts[2]?.trim().split(";");
    pathHeadingAlias.set(doc, alias);
    
    for (const kwi of kwds) {
      const keyw = keywordOriginal[kwi];
      keywordFiles.get(keyw).add(doc);
    }
  }
  
  const treeData = keywordSorted
    .map((item, i) => `${item}|||@${item}`)
    .join('\n');

  keywordsPane.innerHTML = linesToHtmlTree(treeData);
}

function searchKeyword(id, target) {
  const files = keywordFiles.get(id);
  
  var treeData = `${id}|||\n`;
  for (const item of files) {
    var targetkwName = pathHeadingAlias.get(item) || item;
    treeData += ` ${targetkwName}|||${item}\n`
  }
  
  var holder = target.parentElement;
  holder.innerHTML = linesToHtmlTree(treeData);
  openSubtree(holder);
}

function searchKeywordE(event, id) {
  event.preventDefault();
  searchKeyword(id, event.currentTarget);
}

/*E: Feature: Keyword index handling */