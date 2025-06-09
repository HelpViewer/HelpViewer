const C_HIDDENC = 'hidden';
const FILENAME_1STTOPIC = 'README.md';
var FILENAME_DEFAULT_HELPFILE = 'hlp/Help.zip';
const FILENAME_CONFIG = '_config.txt';
const FILENAME_VERSIONFILE = '_version.txt';
const FILENAME_PRJNAME = '_prjname.txt';

const FILENAME_BOOKO = 'book-open.png';
const FILENAME_BOOKC = 'book-closed.png';
const FILENAME_FAVICON = 'favicon.png';

const releasesBaseAddr = 'https://github.com/|/releases';

async function prepareReleasesBaseAddr(arc)
{
  const prjName = (await searchArchiveForFile(FILENAME_PRJNAME, arc)).trim();
  return releasesBaseAddr.replace('|', prjName);
}

async function getReleaseBundleUri(arc, exactVer, fileName)
{
  arc = arc || arcData;
  fileName = fileName || 'package.zip';
  var ver = exactVer || (await searchArchiveForFile(FILENAME_VERSIONFILE, arc)).trim();
  return `${await prepareReleasesBaseAddr(arc)}/download/${ver}/${fileName}`;
}

async function getLatestReleaseBundleUri(arc, fileName)
{
  try {
    arc = arc || arcData;
    const uri0 = await prepareReleasesBaseAddr(arc);
    var uri = uri0 + "/latest";
    const response = await fetch(uri, { redirect: "follow" });
    const txt = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(txt, "text/html");
    const h1 = doc.querySelectorAll("h1");
    const lastH1 = h1[h1.length - 1];
    const ver = lastH1?.innerText ?? null;
    return getReleaseBundleUri(arc, ver, fileName);
  } catch (error) {
    return getReleaseBundleUri(arc, null, fileName);
  }
}

function nameForAnchor(text) {
  return text.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/*S: Zip archive reading functions */
async function searchArchiveForFileB64(fileName, arch) {
  try {
    const fileContent = await arch.file(fileName)?.async('base64');
    return fileContent ?? "";
  } catch (error) {
    return "";
  }
}

async function getDataOfPathInZIPImage(path, archive) {
  const content = await searchArchiveForFileB64(path, archive);
  if (!content) return null;
  var mimeType = 'image/' + path.split('.').pop().toLowerCase();
  return `data:${mimeType};base64,${content}`;
}

async function getZipSubdirs(parentPath, arch) {
  const subdirs = new Set();
  
  arch.forEach((relativePath, file) => {
    if (relativePath.startsWith(parentPath) && relativePath !== parentPath) 
    {
      const subPath = relativePath.slice(parentPath.length);
      const parts = subPath.split("/");
  
      if (parts.length > 1) {
        subdirs.add(parts[0]);
      } else if (file.dir) {
        subdirs.add(parts[0]);
      }
    }
  });
  
  return [...subdirs];
}
/*E: Zip archive reading functions */

/*S: Fixing local in archive paths to base64 dump*/
async function fixImgRelativePathToZipPaths(doc)
{
  doc.querySelectorAll('img').forEach((img) => {
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
