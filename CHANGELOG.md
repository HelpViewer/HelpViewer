# Changelog

## 20260228-1

### 🐞 Bugfix
- 🛡️ View your repository - DOMPurify prunned internal resources rendering (added exception for internal resources)

## 20260228

### 🧑‍🤝‍🧑 User
- 📇🔎 Indexes now supports searching by parts of words. Each part must be found in found word.
- 📚 Show all chapters as book : metadata files from other systems like Docsify are present in scanned files
- 📥 Export : signal border color when export is in progress added

### 🐞 Bugfix
- Bugfix when GitHub artefact of latest package is resolved too late, then general backup URI is used.
- 📚 Show all chapters as book : file names cleaning improved

## 20260225

### 🧑‍🤝‍🧑 User
- Newest version links preparation security improved across help files

### 🐞 Bugfix
- DOMPurify integration fixes (mainly edge states when DOMPurify is not present)
- Fulltext index generation process fixes and improvements connected to asynchronous preparation processing
- Export STATIC : edge cases fixes - dictionary pages preparation, multiple h1 headings processing in single file
- Text variables solution (as alternative solution to javascript with DOMPurify used) refactor and variable names changed

### 🧩 Technology
- Bugfix : pGets : base security fix for XSS by params
- function safeLinkHtml introduced (kept in pTRFlushToDOM)
- Newest version links preparation logic refactor

## 20260216-1

### 🐞 Bugfix
- 🛡️ View your repository - DOMPurify prunned internal resources rendering (added exception for internal resources)

## 20260216

### 🧑‍🤝‍🧑 User
- 📖🔖📇🔎 Span instead of link when not any URI provided (headings and non clickable tree items have better visual format) 
- 📢🖨️ Admonitions printed with simple characters instead of bright unicode icons
- 🛡️📦 DOMPurify library integrated as optional 3rd party component

### 🐞 Bugfix
- 🖼️ Small fixes in content rendering process

### 🧩 Technology
- 🖼️ pTRFlushToDOM - chapter content now supports list of variables which can be used for chapter rendering (currently closed inside plugin, keys - LANG, VERSION with marker \_\_ on both sides)
- 📚 puiButtonAsBook - internal refactor of heading anchors preparation process

## 20260209

### 🧑‍🤝‍🧑 User
- 📥 Added RTF 1.5 / Word 97 export format
- 📢 Admonitions (Highlighted information blocks)
- viewRepo.htm - languages checkbox unchecked for fluent usage for newcomers when they test the application for the 1st time

### 🐞 Bugfix
- 📥 pExportSTATIC - DOCTYPE missing in static pages, dictionaries prunned http external URI path
- 📚 puiButtonAsBook - internal resource is exported and links to it are correct now in chapters and TOC
- 📥 pExportHTM, pExportSTATIC : \_REMOTEHOST\_ marker : slash added in generated paths

### 🧩 Technology
- 🧩 pExport plugin concept introduced for general definition of extensions for application parts (then pExtensionMarkedMd -> pExtensionMarkedAdmonitions), ⚡ PreExportCorrection introduced for chapter text construct simplification (usage with pExtensionMarkedAdmonitions)

## 20260205

### 🧑‍🤝‍🧑 User
- 📥 Added static web pages export (format **STATIC**)
- SVG images are kept in HTML and related (pExportHTM, pExportEPUB, pExportSTATIC) and deleted from bundle (space saved)
- 📥 pExportHTM : sitemap.xml, robots.txt, favicon gathering added
- 📥 pExportEPUB : builds TOC even when not any TOC given from input document (external sources without HelpViewer metadata, h1 from chapters are used)

### 🐞 Bugfix
- 📥 pExportEPUB : bug with wrong MIME type for Android browsers (e-book has been recognized as ZIP archive despite of epub extension)
- 📚 Show all chapters as book : fix in handling unorganized (external) resources without **HelpViewer** usual metadata
- 📥 HTMLToTeX : bugfix for hyperlink URI processing and handling more edge cases

### 🧩 Technology
- 📥 Export button interface refactor (added helper functions)
- ⚡ OfflineDump event introduced for handling collection of information for **STATIC** web pages export from application plugins (puiButton*, puiNavigation, pIndexFile, puiTOCCustomIcons, ... - refactor in these plugins)
- 🖼️ pTRUnconnectedTransformation : when not any extension specified in URI hyperlink, then backup from configuration option **DEFAULTEXTENSION** will be used (default: .md)

## 20260131

### 🧑‍🤝‍🧑 User
- 📥 Added export format **ePub**

### 🧩 Technology
- 📥 Export button interface changed : no direct access to ZIP file handling library, ZIP content preparation centralized, file name can be changed by export format handler

### 🐞 Bugfix
- 📚 Show all chapters as book : all links now correctly point to the relevant subchapters within the merged export document
- 📥 Export button format handlers fixes and refactor in **HTML, md, LaTeX** - fixing of SVG inserting, oredered list items spacing, HTML exports all text with all CSS styles, LaTeX file has author name now, other small issues

## 20260125

### 🧑‍🤝‍🧑 User
- 📥 Export button and handlers for **HTML, md, LaTeX**

### 🐞 Bugfix
- 🖥️ puiButtonSelect : bugfix of WebAim error : missing form label error

## 20251119

### 🧑‍🤝‍🧑 User
- 🧩 Unicode steganography (invisible-code UTF characters) protection improved for notes texts

### 🧩 Technology
- 🤖 CI/CD pipeline fi of .git file
- 🐳 OCI image parent changed to **scratch** (utilities taken from Alpine)

## 20251009

### 🧩 Technology
- solution refactor - main repository divided to solution, appstrap (base), loader, implementation - preparation for develop another application

## 20251004

### 🧑‍🤝‍🧑 User
- 🌈 Select skin + 8 new application styles

### 🐞 Bugfix
- 🐞 DEBUG_MODE directive moved to index.html due to uncomplete scanning of global methods
- ✏️ User notes : correction of multiple notes loading
- history back -> Heading of chapter printed with @@ part (now skipped in heading)

### 🧩 Technology
- 🖥️ puiButtonSelect : select element customised to look like standard panel button
- 🌈 puiButtonSelectSkin
- ✏️ puiButtonUserNotes : configuration key renamed to STOREKEY
- 🖥️ puiSplash : ARIA attributes updated

## 20250930

### 🧑‍🤝‍🧑 User
- 🕘 Version search : improved help project name detection for older help files

### 🐞 Bugfix
- ✏️ User notes : loading and notes position processing fix, tooltips added

## 20250929

### 🧑‍🤝‍🧑 User
- ✏️ User notes
- ✨ Splash screen (if defined in help file)
- 📥 Customization of download package : rearranges in component tree to make interconnections clearer
- Tree view code listings are now without numbers on left

### 🐞 Bugfix
- 🕘 Version search : missing bookmark in heading
- 📥 Customization of download package : close sidebar when browsing via mobile device

### 🧩 Technology
- 📥 Customization of download package : -C list of plugins introduced. All plugins that are not parented in the tree but are located elsewhere in the tree (different substructure) should be there. This list is processed for checking all dependencies when plugin is selected. Usage example: OBJECTEXPLORER, USERNOTES
- 🌐 pLocalizationSwitcher : LocAppend event extended for dynamic localization keys support
- 🧩 pTRAnchorName : anchor generation logic can be changed now (strategies: numbering (default), slugify) or your own can be defined
- ⚙️🏡 pServiceHomeFile : uri to readme page can be changed by configuration option, puiButtonHome updated
- ✨ puiSplash : Splash screen/page for help file
- 🖼️ pTR1stHeadingToTopPanel : fallback for heading started with **_** - these headings will not be processed by plugin if found
- 🖥️ puiHeader : support for act like footer panel with text (good for copyright and other texts)
- 🎨 pColorTheme : refactor, extension of configuration keys
- ⚙️ pServiceActionCursor : Cursor with service action (API for de/activating mode and icon following mouse cursor)
- ✏️ puiButtonUserNotes : User notes plugin - complete action handling - management, browsing, import/export (+ appObjStoreNotes - holds data storage logic for HelpViewer)
- 🛢️ appIndexedDBOperator : basic general logic for **IndexedDB** data storage
- 📖 puiTOCCustomIcons : logic of TOC tree icons processing extracted from appmainNext plugin, logic for sibling tree nodes images support

## 20250921

### 🧑‍🤝‍🧑 User
- Customization of download package - customization of **hvdata/data.zip** file
- Sepia color theme
- Prism listing using transparent background in more cases

### 🐞 Bugfix
- Topic renderer ability to render to any other container renewed
- Sidebar kept on left side if 🧩 puiButtonToggleSide plugin is missing in deployment

### 🧩 Technology
- ➕🧩 pServicePlugin, pServiceLocalization introduced (each plugin can have its own translation texts)
- ➕🧩 puiPanel - toolbar in 2 positions - top, bottom
- ➕🧩 puiButtonCustPackage - Customization of download package
- ➕🧩 puiWatermark - watermarks in ui can be easily attached
- ➕🧩 ObjectExplorer:
  - Localization tables divided from main localization
  - Added methods from plugins and from global space
  - Added variables from global space
  - Reading handler functions from all base classes
  - Refactor of scanning of configuration options
  - Correction in scanning event handler functions in plugins
- ➕ pPluginManagement : storage name added to events
- ➕ pui divided : puiButtonTab, puiButtonTabTree separed
- ➕ IPlugin now scans all parents of callee sibling plugin for onET methods (fix in binding and mapping of methods across dependency tree)
- ➕ puiHeader is now parent of generic puiPanel
- CSS : hiddenprint class introduced

## 20250915

### 🧑‍🤝‍🧑 User
- ➕🔎 Chapter content is now automatically indexed for full-text search when it’s not included in the help package
- ➕📽 Presentation mode
- ➕📖 Added static ARIA roles for tree nodes
- ➕📘🧩 Help for developers published
- Word-wrapping and hyphens in text improved
- sidebar animation improved

### 🐞 Bugfix
- ✏️ fix of some tries to access to not exists pages
- 🌐 last empty link is not produced anymore
- 🌐 html lang tag is updated with language change
- missing source usage when loading customization CSS files in help file base part
- help file custom layout and CSS file loading are not interconnected anymore
- 🧩 plugins now are not allowed to be instantiated twice under the same key name

### 🧩 Technology
- ➕🧩 plugin system : 
  - update in form of definition for some objects
  - plugins can deinit Resource and other sub plugins automatically
  - minimization of plugin functions with super call only
  - improved event system over plugin management actions
- ➕🧩 object explorer:
  - 2 object trees - classes, processes
  - significantly improved with detection of objects
  - cross hyperlinks to objects on pages
  - Filter state icons near plugin instances
  - sender - receiver connection detection
  - dependency trees
  - loading order overview
  - descriptive texts for objects extended
  - some event members typed more strictly than previous time
- ⚡ support for mapping javascript events to application events (event bus)
- 🖼️ pTopicRenderer can now support more than one phase named by file extension
- various refactor in 🖥️ pui plugin to support of javascript events mapping or showing mouse click routing list
- 🖥️ puiButtonTab : _buttonAction will process reply from _preShowAction - if value is false, then tab showing is stopped

## 20250828

### User
- ➕📚 Show all chapters as book : added TOC and table with information about documentation source, version, datetime of export
- ➕📚 Show all chapters as book : extended work even for helps without 📖 TOC
- ➕🕘 Version search : there is now opened 🔖 bookmarks list panel

### 🐞 Bugfix
- History back button again works correctly (not only one step back)

### Technology
- Improved EN documentation of event classes members
- puiButtonObjectExplorer : icons in subchapters, plugins and resource bundles file sizes are measured and shown in explorer (resource bundles handling refactored to work more fluently for future), shows mode of comparing id on event and plugin
- introduced new submodule **i** with reference documentation of event parameters
- Updated pipeline flow for : __dir.lst created in language directory, zip/i subdir subrepo cleanup, sw.js - cache name changed with every published version, ensured DEBUG_MODE = false

## 20250820

### User
- 📚 Show all chapters as book (you can quickly browse whole document file if TOC exists)
- 🌐 Language switching is less restricted than before (at least changing UI language is allowed even if you have opened helpfile of certain language)
- 🕘 Version switching is less restricted than before (you can see the history)
- ✏️ Edit in repository (you can go to edit mode of documentation live repository) (currently works only for GitHub public repositories)
- 📖🔖 Double click on these tabs you can quickly open/close whole tree
- lowered amount of situations requiring complete page reload
- fix of bookmark position in URI to be correct with standard
- Top panel will wrap its buttons part when browsing on mobile device and it is sutable

### Technology
- 🧩 plugin system introduced
- ⚡ event system introduced
- complete code base refactor to operate in plugins and events (partial)
- **DEBUG_MODE** directive introduced
- 🧩 For DEBUG_MODE there is automatically activated ObjectExplorer to browse current state of plugins, instances, events, handlers, configuration and other objects on application load (partial functionality, not documented)
- External libraries - Prism, Marked, Mermaid are now loading only on demand now and are isolated better by plugin system
- Application logging refactored and unified

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
