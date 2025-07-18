const latestVerName = 'latest';

function getDateInYYYYMMDD(date)
{
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function getHelpRepoUri(org, repo, langs = null, branch = 'master')
{
  const rawFilesBaseAddr = 'https://raw.githubusercontent.com/|';
  var prjName = `${org}/${repo}/${branch}/`;

  if (langs && langs !== 'off')
    prjName = `${prjName}__/`;

  return rawFilesBaseAddr.replace('|', prjName);
}

function getHelpRepoUriReleaseZip(org, repo, branch = 'master')
{
  const reply = `https://github.com/${org}/${repo}/releases/download/${branch}/Help-__.zip`;
  return reply;
}

async function getReleaseBundleUri(arc, exactVer, fileName)
{
  const releasesBaseAddr = 'https://api.github.com/repos/|/releases/';
  const keyBrowserDownloadUri = 'browser_download_url';

  arc = arc || FILE_CONFIG_DEFAULT;
  fileName = fileName || 'package.zip';
  const myVer = configGetValue(CFG_KEY__VERSION, '', arc).trim();
  const ver = exactVer || myVer;
  const prjName = configGetValue(CFG_KEY__PRJNAME, '', arc).trim();
  var uriP = releasesBaseAddr.replace('|', prjName);
  const fallbackURI = `https://github.com/${prjName}/releases/download/${myVer}/${fileName}`
  uriP += ver === latestVerName ? latestVerName : `tags/${ver}`;
  
  var response;
  try {
    response = await fetchData(uriP);
  } catch (error) {
    return fallbackURI;
  }
  
  const txt = toText(response);
  const posKey = txt.indexOf(keyBrowserDownloadUri);
  const endVal = `/${fileName}"`;
  const posEndVal = txt.indexOf(endVal);

  if (posKey < 0 || posEndVal < 0)
    return null;

  return txt.substring(keyBrowserDownloadUri.length + posKey + 4, posEndVal - 1 + endVal.length);
}

async function getLatestReleaseBundleUri(arc, fileName)
{
  try {
    return getReleaseBundleUri(arc, latestVerName, fileName);
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
