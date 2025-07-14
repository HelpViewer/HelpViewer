class pStorage extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }
  
  init() {
    var h_EVT_STORAGE_GET = this.wrapAsyncHandler((data) =>
      _Storage.search(data.storageName, data.fileName, data.format)
    );
    this.createEvent(EVT_STORAGE_GET, h_EVT_STORAGE_GET, StorageGet);

    var h_EVT_STORAGE_GET_IMAGE = this.wrapAsyncHandler((data) =>
      _Storage.searchImage(data.storageName, data.fileName)
    );
    this.createEvent(EVT_STORAGE_GET_IMAGE, h_EVT_STORAGE_GET_IMAGE, StorageGetImages);

    var h_EVT_STORAGE_ADD = this.wrapAsyncHandler((data) =>
      _Storage.add(data.storageName, data.fileName, data.fileData)
    );
    this.createEvent(EVT_STORAGE_ADD, h_EVT_STORAGE_ADD, StorageAdd);
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