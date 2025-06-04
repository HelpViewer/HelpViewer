/*S: Topic renderer logic */
const mainTitle = document.getElementById('mtitle');
const contentPane = document.getElementById('content');

// reimplement yourself
function convertRelativePathToViewerURI(val) {
  return val;
}

// reimplement yourself
function setSearchParams(url, path, i) {
}

function SetHeaderText(txt) {
   mainTitle.innerHTML = txt;
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
          
          const newVal = convertRelativePathToViewerURI(val);
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

async function loadPage(event, path, heading, i) {
  event.preventDefault();

  const current = window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(current, document.baseURI);
  setSearchParams(url, path, i);
  idxTreeItem = i;
  history.pushState(null, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);

  await getPathData(path, heading);
  updateNavButtons(i);

  return false;
}

async function getPathData(path, heading) {
  if (!path || path.trim() === '') {
    // read default filename (1st topic)
    pagePath = path = FILENAME_1STTOPIC;
  }
  
  SetHeaderText(heading || path);
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
/*E: Topic renderer logic */