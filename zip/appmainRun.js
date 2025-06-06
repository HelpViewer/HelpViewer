async function runApp() {
  const srcLayout = await searchArchiveForFile('layout.htm', arcData);
  document.body.innerHTML = srcLayout;
  
  const srcMainCSS = await searchArchiveForFile('main.css', arcData);
  appendCSS('mainCSS', srcMainCSS);
  
  const sequence = ['marked.min.js', 'appmainBaseLogic.js',
    'appLocalizationSwitcher.js',  
    'appFTree.js', 'appFNavigation.js', 'appFColorTheme.js', 
    'appLayoutHandlers.js', 'appTopicRenderLogic.js',
    'appmainFileParsingTocTree.js', 'appFKeywordIndex.js', 'appmainNext.js'];

  for (const one of sequence) {
    const srcMarkedJs = await searchArchiveForFile(one, arcData);
    appendJavaScript(one, srcMarkedJs, document.head);
  }
}