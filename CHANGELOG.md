# Changelog

## 20250711
- **Anchor naming logic changed : Instead of slugs anchor naming is now done by level and counter pair**
- Force page break CSS class in print mode and directive introduced
- Bugfix : Bookmark tree has not worked when any link has been opened by right click and Open in New Tab command
- Bugfix: index.html is valid again for W3C check

## 20250708
- **Prism** library **integrated** to solution for code highlight
- Improvement : appmainRun : CSS sequence introduced
- CSS : Bugfix : Print version correctly overrides all rules now and forces font color black
- CSS : main.css is every time the last one to manage all rules
- Improvement : Print version is stripped out of unicode icons : skipping directive introduced, user configuration, help configuration key
- Improvement : Open all collapsible sections in content before print
- Documentation : updated for changes

## 20250705
- Improvement : HelpViewer is able to run even in full CORS now - Required files can and need to be uploaded via form (functionality is reduced - language and version switching not possible, author custom help file UI is not possible to use here in this scenario)
- Searched word marking / highlight in chapter text (user dictionary and fulltext search)
- If screen is too small (mobile), then text will be larger to 130%
- Bugfix : Version switching : versions with -1 has not been processed with hyperlink

## 20250703
- CSS : sidebar page is expanded over maximum part of parent
- Bugfix : Line break on left bottom panel with buttons worked wrongly
- Version switching introduced

## 20250630
- Documentation : Future plans - finished things removed
- Documentation : Description is divided to short sentences, improved with icons and links to other focused documentations
- Improvement : URI path for download is not gathered from HTML FE of GitHub (used API now)
- Documentation : Explicitly mentioned MIT licenses
- Bugfix: Improvement : URI path for download is not gathered from HTML FE of GitHub (used API now) ... fallback for no network fixed
- Quick helper wizard for view any repository in HelpViewer (+ localization)
- Tree paths starting with : : security improved. Only htm(l) and md can be read. Others will return no content even if exists
- TOC tree is able to process ~~ as markup for help version (can be used for help files version adjusting dynamic way)
- Documentation : Future plans - updated for new ideas
- Bugfix : linesToHtmlTree returns empty response in case of wrong inputs than console error as it has been until now
- Improvement : If there is a wide mode (mobile screen) active, then when there is any click in sidebar, the sidebar is closed after click for user to see chapter content immediately

## 20250628-1
- Bugfix: reading fix (//) ... updated replacement to only 1st from right. Previous actions harmed // just behind protocol and created relative URI path unwantedly

## 20250628
- Bugfix: Read markdowns from GitHub has been broken; directory reading common data reading fix (//) ... now uses _base subdirectory here to respect the standard convention like in case of GitHub helpfile repository structure ... combined approach here to fulfill these requirements
- index.html : marker when insert next src or rel link (for future processes)

## 20250626-2
- Bugfix: Read markdowns from GitHub has been broken ... Revert "Improvement: Bugfix : directory reading common data reading fix (//) ... now uses _base ...

## 20250626-1
- Bugfix : language marker __ is kept in URI as long time as possible : without specified help file it has been able to produce malformed links in chapter content text

## 20250626
- robots.txt : updated for rights being less restrictive
- Optimization : DEFAULT_LANG constant defined
- Improvement : language marker __ is kept in URI as long time as possible (sometimes there has been recognized exact language and kept in URI path)
- Improvement : plus.css, plus.js introduced files with pure extension of Viewer functionality (until now only override has been possible)
- Dockerfile : Optimization of kept packages in target image
- Documentation (README.md) : upgraded, old state removed
- Bugfixes
  - Mermaid diagrams drawing fixed
  - Keyword indexes has been able to return topic link multiple times in certain cases with multiple synonym usages
  - CSS : Line border on sidebar
  - Indexes are able to hold situation when you will declare one same word multiple times. Lists of files are joined now correctly
  - directory reading common data reading fix (//) ... now uses _base subdirectory here to respect the standard convention like in case of GitHub helpfile repository structure
  - CSS : Bugfix in responsive - mobile view : left panel arranged correctly over small screen, side switch button now behaves better
  - UI : Left bottom button panel is one lined with 9 or less buttons visible.

## 20250621
- Improvement : application data ZIP is backed up by try for folder name access (it can be unzipped if wanted)
- Viewer is now able to process some extra language which is not known to viewer, but author can define it.
  - When language from local storage does not exists within this help file, then en is selected back and page is reloaded
- CSS : Higher contrast on anchorColor for provide WCAG compliance, Localization strings for equality of experience for all users
- Keyword page on content panel : set list to unlimited
- UI : Left bottom button panel is one lined with 9 or less buttons visible. When 10+ buttons are visible, then multiple rows 
- JS with main logic can be overwritten if needed
- UI: Layout rearranged to have content pane as close as possible to body tag
- UI: Topic navigation aria role added
- Improvement : support for indexing robots.txt
- Bugfix : appEventBus will not be used for now
- Bugfix : Tree items has also URI link on them as same as metadata for processing
- Bugfix : Keyword page is correctly processed and subpages are shown on content panel
- Bugfix : Keyword page on content panel : not collapsible anymore
- Bugfix : Keyword page on content panel : produces list of similar keywords and subpages for keyword (test case: helpviewer on fulltextList)
view is used
- Bugfix : JS with main logic can be overwritten if needed : failed for not exist override
- Bugfix : appLocalizationSwitcher : correction in attribute values setting

## 20250615
- **Ability to read ZIP and disk folders since now** (data sources refactor)
- **Modularization and internal logic refactor** (HTML : tree links and other stuff don't contain javascript direct call anymore, navigation from 1, tree item names has customizable prefix)
- Layout : Grayscale filter removed from language button
- Service Worker : support for message : clearCache
- UI : Button : Switch side of sidebar
- UI : Sedebar bottom panel has multiple rows (per 5 buttons) since now
- Bugfixes
  - UI : border line fixed on right side arrangement
  - archive is a parameter in function fixImgRelativePathToZipPaths (relied on old global parameter)
  - Keyword indexes failed when wrong data passed. Fail it with empty list instead
  - favicon loading has been wrong and dump binary data in text
  - images loading has been wrong and dump binary data in text
  - images in tree node definition has been wrongly converted to correct image path
- Improvement : images from ZIP are still loaded as base64 string, but folder structures are using plain directory path now

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
