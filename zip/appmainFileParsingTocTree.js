// File formats
const N_P_TREEITEM = 'tree-';
const FILENAME_TREE = 'tree.lst';
const PAR_NAME_ID = 'id';

function linesToHtmlTree(linesP) {
  const lines = linesP.split("\n");
  const current = window.location.pathname + window.location.search + window.location.hash;
  const url = new URL(current, document.baseURI);
  var linksEmitted = -1;

  function makeLink(name, note, path, image) {
    const picAdd = !image ? '' : `<img src="${image}" class='treepic'>`;
    if (path) {
      linksEmitted++;
      var clickEvent = '';
      
      if (path.startsWith('#')) {
        clickEvent = `return scrollToAnchorE(event, '${path.substring(1)}')`;
      } else {
        clickEvent = `return loadPage(event, '${path}', '${name}', ${linksEmitted})`;
      }
      
      return `<a href="" ${PAR_NAME_ID}="${N_P_TREEITEM}${linksEmitted}" onclick="${clickEvent}" title="${note}">${picAdd}${name}</a>`;
    } else {
      return `<a title="${note}">${picAdd}${name}</a>`;
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
    const image = parts[2]?.trim() || "";
    const path = parts[3]?.trim() || "";

    var nextIndent = -1;
    if (i + 1 < lines.length) {
      nextIndent = getIndent(lines[i + 1]);
    }

    closeLevels(indent);

    const content = makeLink(name, note, path, image);

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