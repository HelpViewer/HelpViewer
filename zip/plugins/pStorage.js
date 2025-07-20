class StorageAdd extends IEvent {
  constructor() {
    super();
    this.fileName = '';
    this.fileData = undefined;
    this.storageName = '';
    this.requiresDoneHandler = true;
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
  static EVT_STORAGE_GET = StorageGet.name;
  static EVT_STORAGE_GET_IMAGE = StorageGetImages.name;
  static EVT_STORAGE_GET_SUBDIRS = 'EVT_STORAGE_GET_SUBDIRS';

  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];
  
  init() {
    var h_EVT_STORAGE_GET = this.wrapAsyncHandler((data) =>
      _Storage.search(data.storageName, data.fileName, data.format)
    );
    pStorage.eventDefinitions.push([pStorage.EVT_STORAGE_GET, StorageGet, h_EVT_STORAGE_GET]);

    var h_EVT_STORAGE_GET_IMAGE = this.wrapAsyncHandler((data) =>
      _Storage.searchImage(data.storageName, data.fileName)
    );
    pStorage.eventDefinitions.push([pStorage.EVT_STORAGE_GET_IMAGE, StorageGetImages, h_EVT_STORAGE_GET_IMAGE]);

    var h_EVT_STORAGE_ADD = this.wrapAsyncHandler((data) =>
      _Storage.add(data.storageName, data.fileName, data.fileData)
    );
    pStorage.eventDefinitions.push([pStorage.EVT_STORAGE_ADD, StorageAdd, h_EVT_STORAGE_ADD]);

    var h_EVT_STORAGE_GET_SUBDIRS = (data) =>
      data.result = _Storage.getSubdirs(data.storageName, data.fileName);
    pStorage.eventDefinitions.push([pStorage.EVT_STORAGE_GET_SUBDIRS, StorageGetSubdirs, h_EVT_STORAGE_GET_SUBDIRS]);
    super.init();
  }
  
  deInit() {
    super.deInit();
    removeEventDefinition(pStorage.EVT_STORAGE_GET);
    removeEventDefinition(pStorage.EVT_STORAGE_GET_IMAGE);
    removeEventDefinition(pStorage.EVT_STORAGE_ADD);
    removeEventDefinition(pStorage.EVT_STORAGE_GET_SUBDIRS);
  }
}

Plugins.catalogize(pStorage);
