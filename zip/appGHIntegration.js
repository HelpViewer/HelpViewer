const CFG_KEY_VERSIONFILE = '_version';
const CFG_KEY_PRJNAME = '_prjname';

const releasesBaseAddr = 'https://github.com/|/releases';

async function prepareReleasesBaseAddr(arc)
{
  const prjName = configGetValue(CFG_KEY_PRJNAME, '', arc).trim();
  return releasesBaseAddr.replace('|', prjName);
}

async function getReleaseBundleUri(arc, exactVer, fileName)
{
  arc = arc || FILE_CONFIG_DEFAULT;
  fileName = fileName || 'package.zip';
  var ver = exactVer || configGetValue(CFG_KEY_VERSIONFILE, '', arc).trim();
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
