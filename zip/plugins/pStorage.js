class pStorage extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }
  
  init() {
    addEventDefinition(EVT_STORAGE_GET, new EventDefinition(StorageGet));
    this.createEvent(EVT_STORAGE_GET, this.h_EVT_STORAGE_GET);
    addEventDefinition(EVT_STORAGE_GET_IMAGE, new EventDefinition(StorageGetImages));
    this.createEvent(EVT_STORAGE_GET_IMAGE, this.h_EVT_STORAGE_GET_IMAGE);
  }
  
  deInit() {
    super.deInit();
    removeEventDefinition(EVT_STORAGE_GET);
    removeEventDefinition(EVT_STORAGE_GET_IMAGE);
  }

  h_EVT_STORAGE_GET(data) {
    const reply = _Storage.search(data.storageName, data.fileName, data.format);
    data.result = reply;
    reply.then((x) => {
      data.result = x;
      data.doneHandler?.(data);
    });
  }

  h_EVT_STORAGE_GET_IMAGE(data) {
    const reply = _Storage.searchImage(data.storageName, data.fileName);
    data.result = reply;
    reply.then((x) => {
      data.result = x;
      data.doneHandler?.(data);
    });
  }
}

Plugins.catalogize(pStorage);

class StorageGet extends IEvent {
  constructor() {
    super();
    this.fileName = '';
    this.storageName = '';
    this.format = STOF_TEXT;
  }
}

class StorageGetImages extends StorageGet {
}

const EVT_STORAGE_GET = StorageGet.name;
const EVT_STORAGE_GET_IMAGE = StorageGetImages.name;