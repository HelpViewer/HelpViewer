/*S: Topic renderer logic */
const FILENAME_CHANGELOG = 'CHANGELOG.md';

const MARKER_MARKWORD = '@@';

const LK_MSG_PATH_NOT_FOUND_IN_ARCH = 'MSG_PATH_NOT_FOUND_IN_ARCH';

const PANEL_NAME_CHAPTERANCHOR = 'downP-ChapterAnchor';

const C_ANCHOR_CONTENT = ' #';
const PLG_KEY_HASH = '_hash';

const DIRECTIVE_PRINT_PAGEBREAK = '<!-- @print-break -->';
const DIRECTIVE_PRINT_PAGEBREAK_REPLACEMENT = '<div class="page-break"></div>';

const mainTitle = document.getElementById('mtitle');
const contentPane = document.getElementById('content');
const bookmarksPane = document.getElementById('subsList');
const bookmarksPaneButton = document.getElementById(PANEL_NAME_CHAPTERANCHOR);

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
   mainTitle.innerHTML = txt;
   document.title = txt.replace(/<[^>]+>/g, '');
}

function transformOutput(htmlTxt) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlTxt, "text/html");
  
  // Use 1st heading as top panel heading
  const firstH1 = doc.body.firstElementChild;
  
  if (firstH1 && firstH1.tagName.toLowerCase() === 'h1') {
    SetHeaderText(firstH1.innerHTML.trim());
    firstH1.remove();
  }
  
  //relative link paths update for ZIP structure
  const checkList = ["href", "src", "data-href"];

  doc.querySelectorAll("*").forEach((el) => {
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
  
  //end
  return doc.documentElement.outerHTML;
}

async function loadMermaid() {
  const MERMAID_ID = 'ext-mermaid';
  if (!document.getElementById(MERMAID_ID)) {
    const srcMermaid = await storageSearch(STO_DATA, 'mermaid.min.js');
    appendJavaScript(MERMAID_ID, srcMermaid, document.head);
  }
}

function transformOutputConnected(doc) {
  //relative img src paths update for ZIP structure
  fixImgRelativePathToZipPaths(doc, STO_HELP);
  fixImgRelativePathToZipPaths(mainTitle, STO_HELP, ":not(.treepic)");

  //mermaid graphs transformation
  const codeBlocks = doc.querySelectorAll('code.language-mermaid');
  if (codeBlocks.length > 0) {
    loadMermaid().then(() => {
      codeBlocks.forEach(code => {
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = code.textContent;
        code.parentElement.replaceWith(div);
      });
      mermaid.initialize({ startOnLoad: false });
      mermaid.init();
    });
  }
  
  //code listings processing
  doc.querySelectorAll('pre code').forEach((block) => {
    block.classList.add('line-numbers');
    Prism.highlightElement(block);
  });

  //script blocks refresh
  const scripts = doc.querySelectorAll("script");
  var idx = -1;

  scripts.forEach((oldScript) => {
    idx++;
    appendJavaScript(`scr-${idx}`, oldScript.textContent, oldScript.parentElement)
  });
}

function transformOutputConnectedMd(doc) {
  // append bookmarks to chapters
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const counters = [0, 0, 0, 0, 0, 0];

  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));

    if (!heading.id) {
      heading.id = nameForAnchor(heading.textContent, level, counters[level-1]++);
    }
    
    const anchor = document.createElement('a');
    anchor.href = `#${heading.id}`;
    anchor.className = 'anchor-link';
    anchor.textContent = C_ANCHOR_CONTENT;
    
    heading.appendChild(anchor);
  });
}

async function loadPage(event, path, heading, i) {
  event.preventDefault();

  setSearchParams(null, path, i);
  idxTreeItem = i;
  
  await getPathData(path, heading);
  navPanel.updateNavButtons(i);

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
      const word = splits[0].substring(1);
      SetHeaderText(word);
      const dictionary = splits[1];
      const collector = document.createElement('ul');
      collector.className = 'tree';

      var foundKeywords = keywordLists.get(dictionary)?.getTreeData(word, 0);
      const kwFound = foundKeywords.split("\n").length;
      const collector2 = document.createElement('ul');
      collector2.className = 'tree';

      if (foundKeywords !== "" && kwFound > 1) {
        collector2.innerHTML = linesToHtmlTree(foundKeywords, "tr-ContentPage");
        //alert(collector2.innerHTML);
        //const firstList = collector2.querySelectorAll('li');
        //collector.appendChild(firstList);
        //collector2.innerHTML = collector.innerHTML;
        //collector.innerHTML = '';
      }

      keywordLists.get(dictionary)?.searchKeyword(word, collector);
      const firstDetails = collector.querySelector('details')?.querySelector('ul').querySelectorAll('li');

      if (firstDetails) {
        firstDetails.className = 'tree';
        firstDetails.forEach(li => collector2.appendChild(li));
        //collector.appendChild(firstDetails);
      } else {
        collector.innerHTML = "";
      }

      if (collector2.innerHTML) {
        const collector3 = document.createElement('ul');
        collector3.className = 'tree';
        collector3.innerHTML = collector2.innerHTML;
        collector.innerHTML = "";
        collector.appendChild(collector3);
      }

      if (collector.innerHTML) {
        content = collector.innerHTML;
      } else {
        content = ' ';
      }

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

  content = content.replace(DIRECTIVE_PRINT_PAGEBREAK, DIRECTIVE_PRINT_PAGEBREAK_REPLACEMENT);
  
  contentPane.innerHTML = transformOutput(content);
  
  transformOutputConnected(contentPane);
  
  // additional steps for markdown
  if (path.toLowerCase().endsWith('.md')) {
    transformOutputConnectedMd(contentPane);
  }
  
  // fill bookmarks panel
  const bookmarksFound = Array.from(contentPane.querySelectorAll('a'));
  
  var treeString = '';
  
  bookmarksFound.forEach(a => {
    if (!/^H[1-6]$/.test(a.parentElement.tagName)) return;
    treeString += ' '.repeat(parseInt(a.parentElement.tagName.slice(1, 2), 10) - 1);
    treeString += a.parentElement.innerText.slice(0, -C_ANCHOR_CONTENT.length);
    treeString += '|||';
    treeString += path + (new URL(a.href).hash);
    treeString += '\n';
  });
  
  if (treeString.slice(0, 1) === ' ') {
    treeString = mainTitle.innerText + '|||\n' + treeString;
  }
  
  bookmarksPane.innerHTML = linesToHtmlTree(treeString, N_P_TREEITEM_BOOKMARK);
  openSubtree(bookmarksPane);
  
  if (treeString.length == 0) {
    bookmarksPaneButton.classList.add(C_HIDDENC);
  } else {
    bookmarksPaneButton.classList.remove(C_HIDDENC);
  }
  recomputeButtonPanel(bookmarksPaneButton);
  
  // additional steps for files read from repository
  if (path.startsWith("~") && path.endsWith(FILENAME_CHANGELOG)) {
    const headings = document.querySelectorAll('h2');

    SetHeaderText(_T('versionList'));
    
    headings.forEach(heading => {
      const boomark = heading.querySelector('a');
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

  // alternative for empty content panel
  if (content === '') {
    contentPane.innerHTML = _T(LK_MSG_PATH_NOT_FOUND_IN_ARCH);
    if (dataPath === '') {
      contentPane.innerHTML = msgNoData;
    }
  }
  
  contentPane.focus();
  refreshTitlesForLangStrings(null);
  
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

function searchOverTextNodesAndDo(parent, action) {
  if (parent.nodeType === Node.TEXT_NODE) {
    action(parent);
  } else if (
    parent.nodeType === Node.ELEMENT_NODE &&
    !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)
  ) {
    for (let child of Array.from(parent.childNodes)) {
      searchOverTextNodesAndDo(child, action);
    }
  }
}
/*E: Topic renderer logic */

function clearIconsFromText(el) {
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = clearIconsFromTextSingleText(node.textContent);
    }
  });
}

function clearIconsFromTextSingleText(txt) {
  return txt?.replace(/[^\x00-\x7F\u00A0-\u024F.,;:!?()\[\]{}<>"'@#%&*\-\s]/g, '');
}
