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

function hideButton(btnid) {
  const button = document.getElementById(btnid);
  if (button)
    button.classList.add(C_HIDDENC);

  recomputeButtonPanel(button);
}

function recomputeButtonPanel(button)
{
  if (!button) return;
  
  const multilineCSS = 'multi-linePanel';
  const panel = button.parentElement;
  const len = panel.querySelectorAll(`:scope > :not(.${C_HIDDENC})`).length;

  if (len <= 9) {
    panel.classList.remove(multilineCSS);
  } else {
    panel.classList.add(multilineCSS);
  }
}
