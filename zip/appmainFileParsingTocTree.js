// File formats
const N_P_TREEITEM = 'tree';
//const FILENAME_TREE = 'tree.lst';
const PAR_NAME_ID = 'id';

const N_P_TREEITEM_KWDS = 'kwds-';
const N_P_TREEITEM_FTS = 'fts-';
const N_P_TREEITEM_BOOKMARK = 'bmark-';

function linesToHtmlTree(linesP, treename = N_P_TREEITEM) {
  if (!linesP) return '';
  const lines = linesP.trim().split("\n");
  var linksEmitted = 0;

  function makeLink(name, note, path, image) {
    const picAdd = !image ? '' : `<img src="${image}" class='treepic'>`;
    if (path) {
      linksEmitted++;
      var clickEvent = path;
      var hrefVal = '';
      const myVer = configGetValue(CFG_KEY__VERSION, '').trim();
      path = path.replace('~~', myVer);
      
      if (path === '=latestApp') {
          clickEvent = '';
          const nameO = `${treename}|${linksEmitted}`;
          getLatestReleaseBundleUri().then(hrefVal => {
            const targetO = $(nameO);
            if (targetO)
              targetO.href = hrefVal;
          });
      } else
      if (path === '=latestHelp') {
          clickEvent = '';
          const nameO = `${treename}|${linksEmitted}`;
          getLatestReleaseBundleUri(FILE_CONFIG, `Help-${activeLanguage}.zip`).then(hrefVal => {
            const targetO = $(nameO);
            if (targetO)
              targetO.href = hrefVal;
          });
      } else 
      if (path.startsWith('http') || path.startsWith('?')) {
        hrefVal = path;
        clickEvent = '';
      } else {
        hrefVal = convertRelativePathToViewerURI(path, linksEmitted);
        clickEvent = path;
      }

      // if (clickEvent && clickEvent.includes('#') && !clickEvent.startsWith('#'))
      //   clickEvent = '#' + clickEvent.split('#')[1];
    
      return `<a href="${hrefVal}" ${PAR_NAME_ID}="${treename}|${linksEmitted}" data-param="${clickEvent}" title="${note}">${picAdd}${name}</a>`;
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

function buildStringTreeFromMap(source, reply, step = 1, level = 0) {
  var replyI = reply || [];
  const tabbing = ' '.repeat(step).repeat(level);
  
  source.forEach((value, key, map) => {
    const nextLev = level + 1;
    replyI.push(tabbing + key);
    replyI.push(...buildStringTreeFromMap(value, [], step, nextLev));
  });
  return replyI;
}
