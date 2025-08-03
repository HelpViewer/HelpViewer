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

// function searchKeywordE(parentO, id, klist) {
//   getIndexFileData(klist, id);
//   keywordLists.get(klist)?.searchKeyword(id, parentO);
// }
/*E: Feature: Keyword index handling */