const releasesBaseAddr = 'https://github.com/|/releases';

async function prepareReleasesBaseAddr(arc)
{
  const prjName = configGetValue(CFG_KEY__PRJNAME, '', arc).trim();
  return releasesBaseAddr.replace('|', prjName);
}

async function getReleaseBundleUri(arc, exactVer, fileName)
{
  arc = arc || FILE_CONFIG_DEFAULT;
  fileName = fileName || 'package.zip';
  var ver = exactVer || configGetValue(CFG_KEY__VERSION, '', arc).trim();
  return `${await prepareReleasesBaseAddr(arc)}/download/${ver}/${fileName}`;
}

async function getLatestReleaseBundleUri(arc, fileName)
{
  try {
    arc = arc || FILE_CONFIG_DEFAULT;
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

async function insertDownloadLink(hereT, titleMask) {
  const fname = 'package.zip';
  const path = await getLatestReleaseBundleUri(null, fname);
  const linkParts = path.split('/');
  
  if (titleMask) {
    titleMask = titleMask.replace('@', linkParts[linkParts.length -2]);
    titleMask = titleMask.replace('|', fname);
    titleMask = titleMask.replace('_', configGetValue(CFG_KEY__VERSION, '', FILE_CONFIG_DEFAULT).trim());
  } else {
    titleMask = fname;
  }

  const linkTitle = titleMask;
  
  const parentO = document.getElementById(hereT);
  parentO.innerHTML = `<a href="${path}" alt="${fname}" title= "${path}">${linkTitle}</a>`;
}
