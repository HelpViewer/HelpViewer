# Changelog

## 20250613
- Bugfix and Refactor in appmainBaseLogic - appGHIntegration independent, configuration data loading changed to current CI pipeline state
- Support for links to other helpfiles

## 20250612
- Full-text index support introduced
- Searching in user defined keywords list
- UI : Changes to improve WCAG/accessibility standards compliance - ariaLabels added from localization strings
- Metadata variables are stored other way - since now there is consolidated config file inside ZIP/help file
- Improved support of language switching (markup in data path)
- Help files can overwrite user localstorage settings if needed
- Keyword index database internal format changed
- TOC tree icons can be loaded from : png image, configuration entity code, default arrow
- Page title is took from opened document heading
- fallback message about javascript turned off
- fallback message about CORS instructions added (Chrome, Edge)
- Pipeline updated

## 20250608
- Help file for user - "Quick guide" - HelpViewer/helpUser will be newly added to deployment package
- Bugfix : empty line in keywords to files list made stopping error
- TOC tree : introduced constants in URI of items: =latestApp => latest application version, =latestHelp => latest help project version (both version can be even higher if GitHub repository still exists and produces new releases)
- index.html : Added meta information properties - open graph, description, application-name
- Bugfix : CSS : BW color scheme : code listing had white background

## 20250607
- Renderer : only md files are sent to marked, searching for (only) embedded javascripts and recreating them to activate it
- Bugfix : Loading the keyword database failed when no keyword database data was populated
- Sidebar visibility setting state is stored in local storage
- UI : When no TOC list or keywords list is defined, viewer will hide corresponding buttons
- TOC tree is able to accept external link and process it correctly
- Renderer : Removed automatic last line on code listings
- UI : Change color button icon changed
- Bugfix : Dependency list : updated for bundling license files

## 20250606-2
- Dockerfile - Docker images build introduced
- Default help file path is extended to hlp/Help-[localization].zip due to possible support of injection hlp (sub)directory to Docker/Podman container

## 20250606-1
- Main start file renamed to index.html
- Favicon added
- Web App Manifest, favicon for manifest
- Favicon can be customized from help file if named favicon.png
- Release version handling update - attachment file name can be overwritten by function argument
- Bugfix : If zip file does not exists, application will write correctly localization string MSG_NODATA

## 20250606
- Language directories are named according its shortcodes now
- Keywords database alias is used as fallback text for heading if document is not starting with h1 and it has been just reloaded (F5). If it has been activated by TOC tree, then tree item name is used in heading
- Metadata introduced : Version and project name - for application data and help file

## 20250605-1
- Panel with glossary (keyword index)
- Application has version about its version and ability to recover GitHub release original path
- Default helpfile name works with user selected language now (switching language in UI will switch help file to language version if default filename is used)
- Bottom left action button panel background color unification
- Bugfix : In small resolution left panel Close button didn't worked correctly
- Bugfix : Bookmark path in topic tree has not been processed correctly - loading of document failed

## 20250605
- Panel with sub chapters list

## 20250604-2
- TOC tree item now can have associated image
- TOC tree plus and minus signs can be replaced by icons from helpfile

## 20250604-1
- Language localization logic has been added
- Layout has been updated to support languages
- CSS format for language links introduced
- Bugfix: When path has not been specified and 1st loaded, warning message has been shown. Viewer prefers heading titles in order: user defined heading, 1st h1 in markdown or html (if on start of document), file path
- New chapter heading decision order: 1st h1 in markdown or html (if on start of document) (if defined, every time is used in priority), user defined heading, file path
- Updates in pipeline definition, new repository with localization

## 20250604
- Logic internal refactor (functionality unchanged in compare to 20250603-1)

## 20250603-1
- Left bottom panel buttons prunned to currently working only

## 20250603
- First published version

## 20250603-0
- File introduced
