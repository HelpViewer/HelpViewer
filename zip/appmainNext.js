const colorModes = ["inStandard", "inGray", "inBlackWhite", "inBWDuoColor"];

var dataPath = '';
var pagePath = '';

function LoadURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  dataPath = urlParams.get('d');
  pagePath = urlParams.get('p');
  idxTreeItem = parseInt(urlParams.get('id')) || 0;
}

/*S: Feature: Language switching management */
const langTab = document.getElementById('sp-languages');

/*E: Feature: Language switching management */

/*////////////// Unsorted*/

var msgNoData = '';

LoadURLParameters();
updateNavButtons(idxTreeItem);

const mainTitle = document.getElementById('mtitle');
const tree = document.getElementById('tree');
const contentPane = document.getElementById('content');

window.addEventListener('popstate', () => {
  LoadURLParameters();

  if (typeof dataPath !== 'string' || dataPath.trim() === '') {
    dataPath = 'Help.zip';
  }

  getDataOfPathInZIP(pagePath, pagePath);
  updateNavButtons(idxTreeItem);
});

document.getElementById('content').addEventListener('click', function(event) {
  const link = event.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');

  if (href.startsWith('http') || href.startsWith('//')) return;

  event.preventDefault();
  history.pushState({}, '', href);
  
  LoadURLParameters();
  getDataOfPathInZIP(pagePath, pagePath);
});

function SetHeaderText(txt) {
   mainTitle.innerHTML = txt;
}

var archive;

if (!dataPath || !pagePath) {
  SetHeaderText('Select item from left');
}

if (!dataPath) {
  console.log('Data file has not been specified. Use ?d= and its path in URI. Used default file name.');
  dataPath = 'Help.zip';
  msgNoData = 'Data file has not been specified. Use <b>?d=</b> followed by the file path in the URI. The default file name <b>' + dataPath + '</b> was used instead. If the left panel is empty, the file <b>' + dataPath + '</b> probably does not exist in the viewer\'s local directory. As a next step, check <b>p=</b> for a valid path inside the help ZIP archive.';
  document.getElementById('content').innerHTML = msgNoData;
}

if (dataPath) {
  (async () => {
    archive = await loadZipFromUrl(dataPath);
    const srcTreeData = await searchArchiveForFile("tree.lst", archive);
    tree.innerHTML = linesToHtmlTree(srcTreeData);
    revealTreeItem(N_P_TREEITEM + idxTreeItem);
    updateNavButtons(idxTreeItem);
  
    if (pagePath) {
      getDataOfPathInZIP(pagePath, pagePath);
    }
  })();
}

if (!pagePath) {
  pagePath = 'README.md';
  var txt = contentPane.innerHTML;
  getDataOfPathInZIP(pagePath, pagePath);
}

function transformOutput(htmlTxt) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlTxt, "text/html");
  
  // Use 1st heading as top panel heading
  const firstH1 = doc.body.firstElementChild;
  
  if (firstH1 && firstH1.tagName.toLowerCase() === 'h1') {
    if (mainTitle.innerHTML === pagePath) {
      SetHeaderText(firstH1.innerHTML.trim());
    }      
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
          && !val.startsWith("#")) {
          
          const newVal = `?d=${dataPath}&p=${encodeURIComponent(val)}&id=${encodeURIComponent(idxTreeItem)}`;
          el.setAttribute(attr, newVal);
        }
      }
    });
  });
  
  //code listings lines numbering
  doc.querySelectorAll('pre code').forEach((block) => {
    const lines = block.innerText.split('\n');
    block.innerHTML = lines.map(line =>
      `<span>${line}</span>`).join('\n');
    block.parentElement.classList.add('code-numbers');
  });
  
  //end
  return doc.documentElement.outerHTML;
}

async function fixImgRelativePathToZipPaths(doc)
{
  doc.querySelectorAll('img').forEach((img) => {
    (async () => {
      const src = img.getAttribute('src');
      if (src && !/^https?:\/\//.test(src)) {
        const data = await getDataOfPathInZIPImage(src);
        if (data) {
          img.src = data;
        }
      }
    })();
  });
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
}

function transformOutputConnectedMd(doc) {
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach(heading => {
    if (!heading.id) {
      heading.id = nameForAnchor(heading.textContent);
    }
    
    const anchor = document.createElement('a');
    anchor.href = `#${heading.id}`;
    anchor.className = 'anchor-link';
    anchor.textContent = ' #';
    
    heading.appendChild(anchor);
  });
}

function checkSidebarWidth() {
  if (sidebar.offsetWidth / window.innerWidth > 0.5) {
    sidebar.classList.add("too-wide");
  } else {
    sidebar.classList.remove("too-wide");
  }
}

window.addEventListener("resize", checkSidebarWidth);
window.addEventListener("load", checkSidebarWidth);

async function loadPage(event, path, heading, i) {
  event.preventDefault();

  const current = window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(current, document.baseURI);
  url.searchParams.set('p', path);
  url.searchParams.set('id', i);
  idxTreeItem = i;
  history.pushState(null, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);

  await getDataOfPathInZIP(path, heading);
  updateNavButtons(i);

  return false;
}

async function getDataOfPathInZIP(path, heading) {
  SetHeaderText(heading);
  const content = await searchArchiveForFile(path, archive);
  if (window.marked) {
    contentPane.innerHTML = transformOutput(marked.parse(content));
  }
  transformOutputConnected(contentPane);
  
  if (path.toLowerCase().endsWith('.md')) {
    transformOutputConnectedMd(contentPane);
  }
  
  if (content === '') {
    contentPane.innerHTML = `Given path <b>${path}</b> is not present inside the help ZIP archive <b>${dataPath}</b>.`;
    if (dataPath === '') {
      contentPane.innerHTML = msgNoData;
    }
  }
  
  const id = window.location.hash.substring(1);
  scrollToAnchor(id);
}