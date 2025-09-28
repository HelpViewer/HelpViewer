/*S: Feature: Sidebar hide/show (sidebar switching) */
function toggleVisibility(target, newVal) {
  if (!target) return;
  const currentlyHidden = target.classList.contains(C_HIDDENC);
  var newValue = newVal;

  if (newValue == undefined)
    newValue = currentlyHidden;

  if (newValue) {
    if (currentlyHidden)
      target.classList.remove(C_HIDDENC);
  } else {
    if (!currentlyHidden)
      target.classList.add(C_HIDDENC);
  }

  return newValue;
}

function toggleCSSClass(target, className) {
  if (!target) return;
  const currentlyFound = target.classList.contains(className);

  if (currentlyFound)
    target.classList.remove(className);
  else
    target.classList.add(className);

  return !currentlyFound;
}

function hideButton(btnid, newVisibility = false) {
  return sendEvent(EventNames.ElementSetVisibility, (x) => {
    x.value = newVisibility;
    x.elementId = btnid;
  });
}

function scrollToAnchor(id) {
  $(id)?.scrollIntoView({ behavior: 'smooth' });
}

function observeDOMAndDo(handler, parent = document.body, timeout = undefined) {
  if (!parent)
    parent = document.body;
  
  const observer = new MutationObserver((mutations, obs) => {
    if (handler())
      obs.disconnect();
  });

  observer.observe(parent, { childList: true, subtree: true });

  if (timeout) {
    setTimeout(() => {
      observer.disconnect();
    }, timeout);
  }
}

function setPanelsEmpty() {
  contentPane.innerHTML = _T('MSG_NODATA');
  SetHeaderText(_T('HEADING_SELECT_LEFT'));
}

function SetHeaderText(txt) {
  if (!txt)
    txt = '';
  const reply = setHeader(txt);
  document.title = txt.replace(/<[^>]+>/g, '');
  return reply;
}

function searchOverTextNodesAndDo(parent, action) {
  if (parent.nodeType === Node.TEXT_NODE) {
    action(parent);
  } else if (
    parent.nodeType === Node.ELEMENT_NODE &&
    !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)
  ) {
    for (let child of Array.from(parent.childNodes)) {
      searchOverTextNodesAndDo(child, action);
    }
  }
}

function stringToBlob(str, type = "text/plain") {
  const blob = new Blob([str], { type: type });
  return blob;
}

function prepareDownload(dataBlob, fileName, revocationTimeout = 5000) {
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.setAttribute('data-param', url);
  a.target = '_blank';
  a.id = ID_DOWNLOADLINK;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), revocationTimeout);
}
