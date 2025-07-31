/*S: Feature: Sidebar hide/show (sidebar switching) */

const sidebar = document.getElementById('sidebar');
const showBtn = document.getElementById('showBtn');
const container = document.getElementById('container');

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
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
