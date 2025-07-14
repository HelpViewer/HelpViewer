class pStorage extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }

  static eventDefinitions = [];
  
  init() {
    var h_EVT_STORAGE_GET = this.wrapAsyncHandler((data) =>
      _Storage.search(data.storageName, data.fileName, data.format)
    );
    pStorage.eventDefinitions.push([EVT_STORAGE_GET, StorageGet, h_EVT_STORAGE_GET]);

    var h_EVT_STORAGE_GET_IMAGE = this.wrapAsyncHandler((data) =>
      _Storage.searchImage(data.storageName, data.fileName)
    );
    pStorage.eventDefinitions.push([EVT_STORAGE_GET_IMAGE, StorageGetImages, h_EVT_STORAGE_GET_IMAGE]);

    var h_EVT_STORAGE_ADD = this.wrapAsyncHandler((data) =>
      _Storage.add(data.storageName, data.fileName, data.fileData)
    );
    pStorage.eventDefinitions.push([EVT_STORAGE_ADD, StorageAdd, h_EVT_STORAGE_ADD]);
    super.init();
  }
  
  deInit() {
    super.deInit();
    removeEventDefinition(EVT_STORAGE_GET);
    removeEventDefinition(EVT_STORAGE_GET_IMAGE);
    removeEventDefinition(EVT_STORAGE_ADD);
  }
}

Plugins.catalogize(pStorage);

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

class StorageGetImages extends StorageGet {
}

const EVT_STORAGE_ADD = StorageAdd.name;
const EVT_STORAGE_GET = StorageGet.name;
const EVT_STORAGE_GET_IMAGE = StorageGetImages.name;