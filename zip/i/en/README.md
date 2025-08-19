# Object explorer - overview

In this **ObjectExplorer** plug-in, you can browse the data of modules that are active in this session. The module uses module structure matches with the recommended notation for modules. If you do not follow the notation when developing your module, some items may not be loaded here or may be classified into a different type group than you need. The module development process is described in [Authoring Guide][authDoc].

⚠️ The **ObjectExplorer** plug-in module is only loaded if the application is **running with DEBUG_MODE = true in hvdata/appmain.js**. Otherwise, no functionality or output is available, and the application returns a "not found" response for chapters served by the module.

## Groups

In the tree in the side panel, all items are divided hierarchically into a structure of group - module - instance - provided objects.

| Group | Meaning |
|---|---|
<!-- %GROUPS% -->

## Objects

Objects are distinguished in the overview by hierarchy and icon. The meaning of the icons is as follows:

| Object | Meaning |
|---|---|
<!-- %OBJCLASS% -->

[authDoc]: https://helpviewer.github.io/?d=hlp-aguide/Help-__.zip "Authoring Guide"
