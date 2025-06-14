/*S: Topic renderer logic */
const LK_MSG_PATH_NOT_FOUND_IN_ARCH = 'MSG_PATH_NOT_FOUND_IN_ARCH';

const C_ANCHOR_CONTENT = ' #';

const mainTitle = document.getElementById('mtitle');
const contentPane = document.getElementById('content');
const bookmarksPane = document.getElementById('subsList');
const bookmarksPaneButton = document.getElementById('downP-ChapterAnchor');

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
  
  //code listings lines numbering
  doc.querySelectorAll('pre code').forEach((block) => {
    const lines = block.innerText.split('\n');
    if (lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    block.innerHTML = lines.map(line =>
      `<span>${line}</span>`).join('\n');
    block.parentElement.classList.add('code-numbers');
  });
  
  //end
  return doc.documentElement.outerHTML;
}

async function loadMermaid() {
  const MERMAID_ID = 'ext-mermaid';
  if (!document.getElementById(MERMAID_ID)) {
    const srcMermaid = await searchArchiveForFile('mermaid.min.js', arcData);
    appendJavaScript(MERMAID_ID, srcMermaid, document.head);
  }
}

function transformOutputConnected(doc) {
  //relative img src paths update for ZIP structure
  fixImgRelativePathToZipPaths(doc);
  fixImgRelativePathToZipPaths(mainTitle);

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

  headings.forEach(heading => {
    if (!heading.id) {
      heading.id = nameForAnchor(heading.textContent);
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

  const current = window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(current, document.baseURI);
  setSearchParams(url, path, i);
  idxTreeItem = i;
  history.pushState(null, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);

  await getPathData(path, heading);
  navPanel.updateNavButtons(i);

  return false;
}

async function getPathData(path, heading) {
  if (!path || path.trim() === '') {
    // read default filename (1st topic)
    pagePath = path = FILENAME_1STTOPIC;
  }
  
  const bookmarkTest = path.split("#");
  
  if (bookmarkTest.length > 1) {
    path = bookmarkTest[0];
    window.location.hash = bookmarkTest[1];
    const url = new URL(window.location.href);
    setSearchParams(url, path, null);
    history.replaceState(null, '', url);
    getPathData(path, heading);
    return;
  }
  
  SetHeaderText(heading || path);
  var content = await searchArchiveForFile(path, archive);
  
  if (path.toLowerCase().endsWith('.md')) {
    if (window.marked) {
      content = marked.parse(content);
    }
  }
  
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
    treeString += new URL(a.href).hash;
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
  
  // alternative for empty content panel
  if (content === '') {
    contentPane.innerHTML = _T(LK_MSG_PATH_NOT_FOUND_IN_ARCH);
    if (dataPath === '') {
      contentPane.innerHTML = msgNoData;
    }
  }
  
  contentPane.focus();
  refreshTitlesForLangStrings(null);
  
  const id = window.location.hash.substring(1);
  scrollToAnchor(id);
}
/*E: Topic renderer logic */