class StorageAdd extends IEvent {
  constructor() {
    super();
    this.fileName = '';
    this.fileData = undefined;
    this.storageName = '';
    this.requiresDoneHandler = true;
  }
}

class StorageAdded extends IEvent {
  constructor() {
    super();
    this.fileName = '';
    this.storageName = '';
  }
}

class StorageGet extends IEvent {
  constructor() {
    super();
    this.fileName = '';
    this.storageName = '';
    this.format = STOF_TEXT;
    this.requiresDoneHandler = true;
  }
}

class StorageGetSubdirs extends StorageGet {
  constructor() {
    super();
    this.requiresDoneHandler = false;
  }
}

class StorageGetImages extends StorageGet {
}

class pStorage extends IPlugin {
  static EVT_STORAGE_ADD = StorageAdd.name;
  static EVT_STORAGE_ADDED = StorageAdded.name;
  static EVT_STORAGE_GET = StorageGet.name;
  static EVT_STORAGE_GET_IMAGE = StorageGetImages.name;
  static EVT_STORAGE_GET_SUBDIRS = 'EVT_STORAGE_GET_SUBDIRS';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];
  
  init() {
    const T = this.constructor;
    const h_EVT_STORAGE_GET = IPlugin.wrapAsyncHandler((data) =>
      _Storage.search(data.storageName, data.fileName, data.format)
    );
    T.eventDefinitions.push([T.EVT_STORAGE_GET, StorageGet, h_EVT_STORAGE_GET]);

    const h_EVT_STORAGE_GET_IMAGE = IPlugin.wrapAsyncHandler((data) =>
      _Storage.searchImage(data.storageName, data.fileName)
    );
    T.eventDefinitions.push([T.EVT_STORAGE_GET_IMAGE, StorageGetImages, h_EVT_STORAGE_GET_IMAGE]);

    const h_EVT_STORAGE_ADD = IPlugin.wrapAsyncHandler((data) => {
      var reply = _Storage.add(data.storageName, data.fileName, data.fileData);

      reply.then((x) => {
        storageAddedNotification(data.fileName, data.storageName);
      });

      return reply;
    });
    T.eventDefinitions.push([T.EVT_STORAGE_ADD, StorageAdd, h_EVT_STORAGE_ADD]);

    T.eventDefinitions.push([T.EVT_STORAGE_ADDED, StorageAdded, null]); // outside event handlers

    const h_EVT_STORAGE_GET_SUBDIRS = IPlugin.wrapAsyncHandler((data) =>
      _Storage.getSubdirs(data.storageName, data.fileName)
    );
    T.eventDefinitions.push([T.EVT_STORAGE_GET_SUBDIRS, StorageGetSubdirs, h_EVT_STORAGE_GET_SUBDIRS]);
    super.init();
  }
  
  deInit() {
    super.deInit();
  }
}

Plugins.catalogize(pStorage);
