const KEY_LS_COLORTHEME = "colorTheme";

const colorTheme = localStorage.getItem(KEY_LS_COLORTHEME) || 'inStandard';
setColorMode(colorTheme);

let arch3rdp = null;

loadZipFromUrl('hvdata/data.zip')
  .then(arch2 => {
    arch3rdp = arch2;
    return searchArchiveForFile('marked.min.js', arch2);
  })
  .then(content => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = content;
    document.head.appendChild(script);
  });
    
const navL = document.getElementById('nav-left');
const navT = document.getElementById('nav-top');
const navR = document.getElementById('nav-right');

const sidebar = document.getElementById('sidebar');
const showBtn = document.getElementById('showBtn');
let msgNoData = '';

let dataPath = '';
let pagePath = '';
let idxTreeItem = 0;

function LoadURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  dataPath = urlParams.get('d');
  pagePath = urlParams.get('p');
  idxTreeItem = parseInt(urlParams.get('id')) || 0;
}

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

let archive;

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
  loadZipFromUrl(dataPath)
    .then(arch2 => {
      archive = arch2;
      return searchArchiveForFile("tree.lst", arch2);
    })
    .then(content => {
      tree.innerHTML = linesToHtmlTree(content);
      revealTreeItem('tree-' + idxTreeItem);
      updateNavButtons(idxTreeItem);
      
      if (pagePath) {
        getDataOfPathInZIP(pagePath, pagePath);
      }
    })
    .catch(err => {
      console.error("Error:", err);
    });
}

if (!pagePath) {
  pagePath = 'README.md';
  let txt = contentPane.innerHTML;
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

async function loadMermaid(callback) {
  if (window.mermaid) {
    callback();
    return;
  }
  
  await appendJavascript('mermaid.min.js', callback);
}

async function appendJavascript(path, callback) {
  const script = document.createElement('script');
  if (/^https?:\/\//.test(path)) {
    script.src = path;
  } else {
    script.type = 'text/javascript';
    content = await searchArchiveForFile(path, arch3rdp);
    script.textContent = content;
  }
  script.onload = () => callback();
  document.head.appendChild(script);
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

function transformOutputConnected(doc) {
  //relative img src paths update for ZIP structure
  fixImgRelativePathToZipPaths(doc);
  fixImgRelativePathToZipPaths(mainTitle);

  //mermaid graphs transformation
  const codeBlocks = doc.querySelectorAll('code.language-mermaid');
  if (codeBlocks.length > 0) {
    loadMermaid(() => {}).then(() => {
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

async function loadZipFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();

    const arch = await JSZip.loadAsync(arrayBuffer);
    return arch;
  } catch (error) {
    throw error;
  }
}

async function searchArchiveForFile(fileName, arch) {
  const fileObj = Object.keys(arch.files)
    .map(name => arch.files[name])
    .find(file => file.name === fileName);

  if (fileObj) {
    const content = await fileObj.async("text");
    return content;
  } else {
    return "";
  }
}

async function searchArchiveForFileB64(fileName, arch) {
  const fileObj = Object.keys(arch.files)
    .map(name => arch.files[name])
    .find(file => file.name === fileName);

  if (fileObj) {
    const content = await fileObj.async("base64");
    return content;
  } else {
    return "";
  }
}

function switchFullScreen() {
  document.fullscreenElement 
    ? document.exitFullscreen() 
    : document.documentElement.requestFullscreen();
}

function switchColorMode() {
  const base = document.body;
  const modes = ["inStandard", "inGray", "inBlackWhite", "inBWDuoColor"];
  const idx = (modes.indexOf(base.classList[0]) + 1) % modes.length;
  base.className = modes[idx];
  localStorage.setItem(KEY_LS_COLORTHEME, modes[idx]);
}

function setColorMode(val) {
  const base = document.body;
  base.className = val;
  localStorage.setItem(KEY_LS_COLORTHEME, val);
}

function toggleSidebar() {
  if (sidebar.classList.contains('hidden')) {
    sidebar.classList.remove('hidden');
    showBtn.style.display = 'none';
  } else {
    sidebar.classList.add('hidden');
    showBtn.style.display = 'inline-block';
  }
}

function checkSidebarWidth() {
  if (sidebar.offsetWidth / window.innerWidth > 0.5) {
    sidebar.classList.add("too-wide");
  } else {
    sidebar.classList.remove("too-wide");
  }
}

function revealTreeItem(id) {
  const el = document.getElementById(id);
  if (!el) return;

  let parent = el.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') {
      parent.open = true;
    }
    parent = parent.parentElement;
  }
}

window.addEventListener("resize", checkSidebarWidth);
window.addEventListener("load", checkSidebarWidth);

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

async function loadPage(event, path, heading, i) {
  event.preventDefault();
  await _loadPageI(path, heading, i);
  return false;
}

async function _loadPageI(path, heading, i) {
  const current = window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(current, document.baseURI);
  url.searchParams.set('p', path);
  url.searchParams.set('id', i);
  idxTreeItem = i;
  history.pushState(null, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);

  await getDataOfPathInZIP(path, heading);
  updateNavButtons(i);
}

function updateNavButtons(i) {
  if (i >= 0) {
    navL.classList.remove('hidden-btn');
    navT.classList.remove('hidden-btn');
    navR.classList.remove('hidden-btn');
  } else {
    navL.classList.add('hidden-btn');
    navT.classList.add('hidden-btn');
    navR.classList.add('hidden-btn');
  }
  
  const currentTreeItem = document.getElementById('tree-' + i);
  const nextTreeItem = document.getElementById('tree-' + (i + 1));
  
  if (i == 0) {
    navL.classList.add('hidden-btn');
    navT.classList.add('hidden-btn');
  }
  
  if (nextTreeItem == null) {
    navR.classList.add('hidden-btn');
  }
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
  let mimeType = 'image/' + path.split('.').pop().toLowerCase();
  return `data:${mimeType};base64,${content}`;
}

// File formats
function linesToHtmlTree(linesP) {
  const lines = linesP.split("\n");
  const current = window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(current, document.baseURI);
  let linksEmitted = -1;

  function makeLink(name, note, path) {
    if (path) {
      linksEmitted++;
      return `<a href="" id="tree-${linksEmitted}" onclick="return loadPage(event, '${path}', '${name}', ${linksEmitted})" title="${note}">${name}</a>`;
    } else {
      return `<a title="${note}">${name}</a>`;
    }
  }

  let html = "";

  const stack = [];

  function getIndent(line) {
    let count = 0;
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = getIndent(line);
    const trimmed = line.trim();
    const parts = trimmed.split("|");
    const name = parts[0]?.trim() || "";
    const note = parts[1]?.trim() || "";
    const path = parts[2]?.trim() || "";

    let nextIndent = -1;
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

  return `${html}`;
}
// E: File formats