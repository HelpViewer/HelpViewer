const C_HIDDENC = 'hidden';
const FILENAME_1STTOPIC = 'README.md';
const FILENAME_DEFAULT_HELPFILE = 'Help.zip';

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
/*E: Zip archive reading functions */