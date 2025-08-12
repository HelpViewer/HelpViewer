function removeIconsForPrint() {
  openSubtree(contentPane);

  var keepIconsConfig = (configGetValue(CFG_KEY_OverridePrintKeepIcons) || 0) == 1 ? 1 : 0;
  const DIRECTIVE_PRINT_KEEP_ICONS = '<!-- @print-keep-icons -->';
  const directivePresent = contentPane.innerHTML.includes(DIRECTIVE_PRINT_KEEP_ICONS) ? 1 : 0;
  var decision = (keepIconsConfig + directivePresent) % 2;

  if (printIcons == 0 || printIcons == 1)
    decision = printIcons;

  if (decision == 1)
    return;

  $A('.content *').forEach(el => {
    clearIconsFromText(el);
  });

  const DIRECTIVE_PRINT_PAGEBREAK = '<!-- @print-break -->';
  const DIRECTIVE_PRINT_PAGEBREAK_REPLACEMENT = '<div class="page-break"></div>';
  contentPane.innerHTML = contentPane.innerHTML.replace(DIRECTIVE_PRINT_PAGEBREAK, DIRECTIVE_PRINT_PAGEBREAK_REPLACEMENT);
  
  setHeader(clearIconsFromTextSingleText(getHeader()));

  document.title = clearIconsFromTextSingleText(document.title);
}

function clearIconsFromText(el) {
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = clearIconsFromTextSingleText(node.textContent);
    }
  });
}

function clearIconsFromTextSingleText(txt) {
  return txt?.replace(/[^\x00-\x7F\u00A0-\u024F.,;:!?()\[\]{}<>"'@#%&*\-\s]/g, '');
}
