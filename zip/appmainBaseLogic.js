const C_HIDDENC = 'hidden';
const FILENAME_1STTOPIC = 'README.md';
const FILENAME_CONFIG = '_config.txt';

const CFG_KEY__VERSION = '_version';
const CFG_KEY__PRJNAME = '_prjname';
const CFG_KEY__LANG = '_lang';

const FILENAME_BOOKO = 'book-open.png';
const FILENAME_BOOKC = 'book-closed.png';
const FILENAME_FAVICON = 'favicon.png';

function nameForAnchor(text, level, levelCounter) {
  return `h-${level}-${levelCounter}`;
  // return text.toLowerCase()
  //   .trim()
  //   .replace(/[^\w\s-]/g, '')
  //   .replace(/\s+/g, '-')
  //   .replace(/-+/g, '-');
}

/*S: Zip archive reading functions */

async function getDataOfPathInZIPImage(path, archive) {
  const content = await _Storage.searchImage(archive, path);
  return content;
}
/*E: Zip archive reading functions */

/*S: Fixing local in archive paths to base64 dump*/
async function fixImgRelativePathToZipPaths(doc, archive, exclude = '')
{
  doc.querySelectorAll(`img${exclude}`).forEach((img) => {
    (async () => {
      const src = img.getAttribute('src');
      if (src && !/^https?:\/\//.test(src)) {
        const data = await getDataOfPathInZIPImage(src, archive);
        if (data) {
          img.src = data;
        }
      }
    })();
  });
}
/*E: Fixing local in archive paths to base64 dump*/

function changeFavicon(src) {
  var link = document.querySelector("link[rel~='icon']");
  
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = src;
}
