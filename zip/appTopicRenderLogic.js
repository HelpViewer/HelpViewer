/*S: Topic renderer logic */
const FILENAME_CHANGELOG = 'CHANGELOG.md';

const MARKER_MARKWORD = '@@';

const LK_MSG_PATH_NOT_FOUND_IN_ARCH = 'MSG_PATH_NOT_FOUND_IN_ARCH';

const PANEL_NAME_CHAPTERANCHOR = 'downP-ChapterAnchor';

const C_ANCHOR_CONTENT = ' #';
const PLG_KEY_HASH = '_hash';

const contentPane = $('content');
const bookmarksPane = $('subsList');
const bookmarksPaneButton = $(PANEL_NAME_CHAPTERANCHOR);

// interconnect with your logic
var msgNoData = '';

// interconnect with get parameter
var pagePath = '';
var dataPath = '';

// reimplement yourself
function convertRelativePathToViewerURI(val) {
  return val;
}

// reimplement yourself
function setSearchParams(url, path, i) {
}

function SetHeaderText(txt) {
  setHeader(txt);
  document.title = txt.replace(/<[^>]+>/g, '');
}

async function loadPage(event, path, heading, i) {
  event?.preventDefault();

  setSearchParams(null, path, i);
  idxTreeItem = i;
  
  await getPathData(path, heading);
  //navPanel.updateNavButtons(i);

  return false;
}

async function getPathData(path, heading) {
  if (!path || path.trim() === '') {
    // read default filename (1st topic)
    pagePath = path = FILENAME_1STTOPIC;
  }
  
  var keywordToShow = path.split(MARKER_MARKWORD);
  path = keywordToShow[0];

  if (keywordToShow.length > 1)
    keywordToShow = keywordToShow[1];
  else
    keywordToShow = null;

  const bookmarkTest = path.split("#");
  
  if (bookmarkTest.length > 1) {
    path = bookmarkTest[0];
    setToBookmark(bookmarkTest[1]);
    getPathData(path, heading);
    return;
  }
  
  SetHeaderText(heading || path);
  var content = "";

  if (path.startsWith("@")) {
    const splits = path.split(":");
    if (splits.length <= 1) {
      content = "";
    } else {

    }
  } else 
  if (path.startsWith(":")) {
    if (/\.(md|htm|html)$/i.test(path)) {
      content = await storageSearch(STO_DATA, path.substring(1));
    } else {
      content = '';
    }
  } else 
  if (path.startsWith("~")) {
    try {
      const verList = await fetchData(path.substring(1));
      content = toText(verList);
    } catch (error) {
      content = '';
    }
  } else {
    content = await storageSearch(STO_HELP, path);
  }
  
  if (path.toLowerCase().endsWith('.md')) {
    if (window.marked) {
      content = marked.parse(content);
    }
  }

  //content = content.replace(DIRECTIVE_PRINT_PAGEBREAK, DIRECTIVE_PRINT_PAGEBREAK_REPLACEMENT);
  
  contentPane.innerHTML = transformOutput(content);
  
  transformOutputConnected(contentPane);
  
  // additional steps for markdown
  if (path.toLowerCase().endsWith('.md')) {
    transformOutputConnectedMd(contentPane);
  }
  
  // additional steps for files read from repository
  if (path.startsWith("~") && path.endsWith(FILENAME_CHANGELOG)) {
    const headings = $A('h2');

    SetHeaderText(_T('versionList'));
    
    headings.forEach(heading => {
      const boomark = $O('a', heading);
      const verId = heading.textContent.replace(C_ANCHOR_CONTENT, '');
      
      if (isNaN(Number(verId.substring(0,8)))) 
        return;

      heading.textContent = '';
      const uriZIP = getHelpRepoUriReleaseZip(PRJNAME_VAL[0], PRJNAME_VAL[1], verId);
      const targURI = `?${PAR_NAME_DOC}=${uriZIP}&${PAR_NAME_PAGE}=${pagePath}`;

      const link = document.createElement('a');
      link.href = targURI;
      link.textContent = verId;
      
      heading.appendChild(link);

      const linkDownload = document.createElement('a');
      linkDownload.href = uriZIP.replace('__', getActiveLanguage());
      linkDownload.innerText = '📥';
      heading.appendChild(linkDownload);
      heading.appendChild(boomark);
    });
  }
  
  contentPane.focus();
  refreshTitlesForLangStrings();
  
  const id = getGets(PLG_KEY_HASH, null)?.substring(1);
  scrollToAnchor(id);

  if (keywordToShow && keywordToShow.length > 0) {
    const securedKeyword = keywordToShow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(securedKeyword, 'gi');

    searchOverTextNodesAndDo(contentPane, (parent) => {
      const match = parent.nodeValue.match(regex);
      if (match) {
        const span = document.createElement('span');
        span.innerHTML = parent.nodeValue.replace(regex, (m) =>
          `<span class='wordFound'>${m}</span>`
        );
        parent.replaceWith(...span.childNodes);
      }
    });

  }
}
/*E: Topic renderer logic */
