async function runApp() {
  const srcLayout = await searchArchiveForFile('layout.htm', arcData);
  document.body.innerHTML = srcLayout;
  
  const srcMainCSS = await searchArchiveForFile('main.css', arcData);
  appendCSS('mainCSS', srcMainCSS);
  
  const srcMarkedJs = await searchArchiveForFile('marked.min.js', arcData);
  appendJavaScript('ext-marked', srcMarkedJs, document.head);
  
  const srcAppNextJs = await searchArchiveForFile('appmainNext.js', arcData);
  appendJavaScript('appNext', srcAppNextJs, document.body);
}