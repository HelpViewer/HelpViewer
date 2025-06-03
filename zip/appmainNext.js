const C_HIDDENC = 'hidden';

/*S: Topic tree handling */
var idxTreeItem = 0;

function loadPageByTreeId(id) {
  const treeItem = document.getElementById('tree-' + id);
  if (treeItem) {
    const syntheticClick = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    });
    treeItem.dispatchEvent(syntheticClick);
    idxTreeItem = id;
  }
  revealTreeItem('tree-' + id);
}

function revealTreeItem(id) {
  const el = document.getElementById(id);
  if (!el) return;

  var parent = el.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') {
      parent.open = true;
    }
    parent = parent.parentElement;
  }
}
/*E: Topic tree handling */

/*S: Feature: Right top panel, page navigation buttons */
const navL = document.getElementById('nav-left');
const navT = document.getElementById('nav-top');
const navR = document.getElementById('nav-right');

function navPrev(event) {
  event.preventDefault();
  loadPageByTreeId(idxTreeItem-1);
}

function navNext(event) {
  event.preventDefault();
  loadPageByTreeId(idxTreeItem+1);
}

function navTop(event) {
  event.preventDefault();
  const treeItem = document.getElementById('tree-' + idxTreeItem);
  const upId = parseInt(treeItem.parentElement.parentElement.parentElement.querySelector('summary > a').id.slice(5));
  loadPageByTreeId(upId);
}

function updateNavButtons(i) {
  if (i >= 0) {
    navL.classList.remove(C_HIDDENC);
    navT.classList.remove(C_HIDDENC);
    navR.classList.remove(C_HIDDENC);
  } else {
    navL.classList.add(C_HIDDENC);
    navT.classList.add(C_HIDDENC);
    navR.classList.add(C_HIDDENC);
  }
  
  const currentTreeItem = document.getElementById('tree-' + i);
  const nextTreeItem = document.getElementById('tree-' + (i + 1));
  
  if (i == 0) {
    navL.classList.add(C_HIDDENC);
    navT.classList.add(C_HIDDENC);
  }
  
  if (nextTreeItem == null) {
    navR.classList.add(C_HIDDENC);
  }
}
/*E: Feature: Right top panel, page navigation buttons */

/*S: Feature: Sidebar hide/show (sidebar switching) */
const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
  if (sidebar.classList.contains(C_HIDDENC)) {
    sidebar.classList.remove(C_HIDDENC);
    showBtn.classList.add(C_HIDDENC);
  } else {
    sidebar.classList.add(C_HIDDENC);
    showBtn.classList.remove(C_HIDDENC);
  }
}
/*E: Feature: Sidebar hide/show (sidebar switching) */

/*S: Feature: Switch fullscreen */
function switchFullScreen() {
  document.fullscreenElement 
    ? document.exitFullscreen() 
    : document.documentElement.requestFullscreen();
}
/*E: Feature: Switch fullscreen */

/*S: Feature: Set color theme */
const KEY_LS_COLORTHEME = "colorTheme";

const colorTheme = localStorage.getItem(KEY_LS_COLORTHEME) || 'inStandard';
setColorMode(colorTheme);

function switchColorMode() {
  const base = document.body;
  const modes = ["inStandard", "inGray", "inBlackWhite", "inBWDuoColor"];
  const idx = (modes.indexOf(base.classList[0]) + 1) % modes.length;
  setColorMode(modes[idx]);
}

function setColorMode(val) {
  const base = document.body;
  base.className = val;
  localStorage.setItem(KEY_LS_COLORTHEME, val);
}
/*E: Feature: Set color theme */

var dataPath = '';
var pagePath = '';

function LoadURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  dataPath = urlParams.get('d');
  pagePath = urlParams.get('p');
  idxTreeItem = parseInt(urlParams.get('id')) || 0;
}

/*////////////// Unsorted*/
function showSidebarTab(id) {
  const tab = document.getElementById(id);
  
  Array.from(tab.parentElement.children).forEach(child => {
    child.classList.add(C_HIDDENC);
  });

  tab.classList.remove(C_HIDDENC);
}

const showBtn = document.getElementById('showBtn');
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

function scrollToAnchor(id) {
  const targetO = document.getElementById(id);
  if (targetO) {
    targetO.scrollIntoView({ behavior: 'smooth' });
  }
}

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
    revealTreeItem('tree-' + idxTreeItem);
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

function nameForAnchor(text) {
  return text.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

async function searchArchiveForFileB64(fileName, arch) {
  try {
    const fileContent = await arch.file(fileName)?.async('base64');
    return fileContent ?? "";
  } catch (error) {
    return "";
  }
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

async function getDataOfPathInZIPImage(path) {
  const content = await searchArchiveForFileB64(path, archive);
  var mimeType = 'image/' + path.split('.').pop().toLowerCase();
  return `data:${mimeType};base64,${content}`;
}

// File formats
function linesToHtmlTree(linesP) {
  const lines = linesP.split("\n");
  const current = window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(current, document.baseURI);
  var linksEmitted = -1;

  function makeLink(name, note, path) {
    if (path) {
      linksEmitted++;
      return `<a href="" id="tree-${linksEmitted}" onclick="return loadPage(event, '${path}', '${name}', ${linksEmitted})" title="${note}">${name}</a>`;
    } else {
      return `<a title="${note}">${name}</a>`;
    }
  }

  var html = "";

  const stack = [];

  function getIndent(line) {
    var count = 0;
    for (const ch of line) {
      if (ch === " ") count++;
      else break;
    }
    return count;
  }

  function closeLevels(toLevel) {
    while (stack.length > toLevel) {
      html += "</ul></details></li>";
      stack.pop();
    }
  }

  for (var i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = getIndent(line);
    const trimmed = line.trim();
    const parts = trimmed.split("|");
    const name = parts[0]?.trim() || "";
    const note = parts[1]?.trim() || "";
    const path = parts[2]?.trim() || "";

    var nextIndent = -1;
    if (i + 1 < lines.length) {
      nextIndent = getIndent(lines[i + 1]);
    }

    closeLevels(indent);

    const content = makeLink(name, note, path);

    if (nextIndent > indent) {
      html += `<li><details><summary>${content}</summary><ul>`;
      stack.push(indent);
    } else {
      html += `<li>${content}</li>`;
    }
  }

  closeLevels(0);

  return html;
}
// E: File formats