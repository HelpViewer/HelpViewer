const EVT_STORAGE_GET = 'STORAGE_GET';

class pStorage extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
  }
  
  init() {
    addEventDefinition(EVT_STORAGE_GET, StorageGet);
    this.createEvent(EVT_STORAGE_GET, this.h_EVT_STORAGE_GET);
  }
  
  deInit() {
    super.deInit();
    removeEventDefinition(EVT_STORAGE_GET);
  }

  async h_EVT_STORAGE_GET(data) {
    const reply = await _Storage.search(data.storageName, data.fileName, data.format);
    data.result = reply;
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
