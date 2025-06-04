const C_HIDDENC = 'hidden';
const FILENAME_1STTOPIC = 'README.md';
const FILENAME_DEFAULT_HELPFILE = 'Help.zip';

const FILENAME_BOOKO = 'book-open.png';
const FILENAME_BOOKC = 'book-closed.png';

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