class IndexedStore {
  constructor(dbPromise, storeName) {
    this.dbPromise = dbPromise;
    this.storeName = storeName;
  }

  async _transaction(mode, callback) {
    const db = await this.dbPromise;
    const tx = db.transaction(this.storeName, mode);
    const store = tx.objectStore(this.storeName);
    return await callback(store);
  }

  async add(record) {
    return this._transaction('readwrite', store => new Promise((res, rej) => {
      const req = store.add(record);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }));
  }

  async get(id) {
    return this._transaction('readonly', store => new Promise((res, rej) => {
      const req = store.get(id);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }));
  }

  async getAll() {
    return this._transaction('readonly', store => new Promise((res, rej) => {
      const req = store.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }));
  }

  async update(id, updates) {
    return this._transaction('readwrite', store => new Promise((res, rej) => {
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result) {
          const updated = { ...req.result, ...updates };
          const putReq = store.put(updated);
          putReq.onsuccess = () => res(putReq.result);
          putReq.onerror = () => rej(putReq.error);
        } else rej(new Error('Záznam nenalezen'));
      };
      req.onerror = () => rej(req.error);
    }));
  }

  async delete(id) {
    return this._transaction('readwrite', store => new Promise((res, rej) => {
      const req = store.delete(id);
      req.onsuccess = () => res(true);
      req.onerror = () => rej(req.error);
    }));
  }

  async getAllByIndex(indexName, value) {
    return this._transaction('readonly', store => new Promise((res, rej) => {
      const index = store.index(indexName);
      const req = index.getAll(value);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }));
  }

  async getByIndex(indexName, value) {
    return this._transaction('readonly', store => new Promise((res, rej) => {
      const index = store.index(indexName);
      const req = index.get(value);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }));
  }

  async count() {
    return this._transaction('readonly', store => new Promise((res, rej) => {
      const req = store.count();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }));
  }
}

class HelpViewerDB {
  constructor() {
    this.dbPromise = null;
    this.helpFileIdx = null;
    this.stores = new Map();
    this.prjName = '';
  }

  async getDb(prjName = this.prjName) {
    if (!this.dbPromise) {
      this.dbPromise = this._initializeDatabase();
      
      await this.dbPromise;
      //this.configGetValue('CFG_KEY__PRJNAME', '', 'STO_HELP').trim() || 'dataPathGeneral';
      this.helpFileIdx = await this.getHelpIdByName(prjName);
      
      if (this.helpFileIdx) {
        await this._ensureHelpTables(this.helpFileIdx);
      }
    }
    
    return this.dbPromise;
  }

  async _initializeDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("HelpViewer", 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('helpFiles')) {
          const table = db.createObjectStore('helpFiles', { keyPath: "id", autoIncrement: true });
          table.createIndex("byName", "jmeno", { unique: true });
        }
      };
    });
  }

  async _ensureHelpTables(helpFileIdx) {
    const db = await this.dbPromise;
    const tabUserNotes = `hlf.${helpFileIdx}.notes`;
    const tabUserNotesChapters = `hlf.${helpFileIdx}.chapters`;
    
    if (!db.objectStoreNames.contains(tabUserNotes) || !db.objectStoreNames.contains(tabUserNotesChapters)) {
      await this._upgradeForHelpTables(helpFileIdx);
    }
  }

  async _upgradeForHelpTables(helpFileIdx) {
    const db = await this.dbPromise;
    const currentVersion = db.version;
    db.close();
    
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("HelpViewer", currentVersion + 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const newDb = event.target.result;
        
        const tabUserNotes = `hlf.${helpFileIdx}.notes`;
        const tabUserNotesChapters = `hlf.${helpFileIdx}.chapters`;
        
        if (!newDb.objectStoreNames.contains(tabUserNotesChapters)) {
          const chaptersStore = newDb.createObjectStore(tabUserNotesChapters, { keyPath: "id", autoIncrement: true });
          chaptersStore.createIndex("byName", "jmeno", { unique: false });
        }
        
        if (!newDb.objectStoreNames.contains(tabUserNotes)) {
          const notesStore = newDb.createObjectStore(tabUserNotes, { keyPath: "id", autoIncrement: true });
          notesStore.createIndex("byChapterId", "chapterId", { unique: false });
        }
      };
    });
    
    return this.dbPromise;
  }

  getStore(storeName) {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new IndexedStore(this.dbPromise, storeName));
    }
    return this.stores.get(storeName);
  }

  get helpFilesStore() {
    return this.getStore('helpFiles');
  }

  get chaptersStore() {
    if (!this.helpFileIdx) throw new Error('HelpFileIdx není nastaven');
    return this.getStore(`hlf.${this.helpFileIdx}.chapters`);
  }

  get notesStore() {
    if (!this.helpFileIdx) throw new Error('HelpFileIdx není nastaven');
    return this.getStore(`hlf.${this.helpFileIdx}.notes`);
  }

  async getHelpIdByName(name) {
    await this.getDb();
    const result = await this.helpFilesStore.getByIndex('byName', name);
    return result ? result.id : null;
  }

  async addHelpFile(jmeno, data = {}) {
    await this.getDb();
    return await this.helpFilesStore.add({ jmeno, ...data });
  }

  async getHelpFile(id) {
    await this.getDb();
    return await this.helpFilesStore.get(id);
  }

  async updateHelpFile(id, updates) {
    await this.getDb();
    return await this.helpFilesStore.update(id, updates);
  }

  async deleteHelpFile(id) {
    await this.getDb();
    return await this.helpFilesStore.delete(id);
  }

  async getAllHelpFiles() {
    await this.getDb();
    return await this.helpFilesStore.getAll();
  }

  async addChapter(jmeno, data = {}) {
    await this.getDb();
    return await this.chaptersStore.add({ jmeno, ...data });
  }

  async getChapter(id) {
    await this.getDb();
    return await this.chaptersStore.get(id);
  }

  async getChapterIdByName(jmeno) {
    await this.getDb();
    const result = await this.chaptersStore.getByIndex('byName', jmeno);
    return result ? result.id : null;
  }

  async updateChapter(id, updates) {
    await this.getDb();
    return await this.chaptersStore.update(id, updates);
  }

  async deleteChapter(id) {
    await this.getDb();
    return await this.chaptersStore.delete(id);
  }

  async getAllChapters() {
    await this.getDb();
    return await this.chaptersStore.getAll();
  }

  async addNote(chapterId, content, data = {}) {
    await this.getDb();
    return await this.notesStore.add({ chapterId, content, ...data });
  }

  async getNote(id) {
    await this.getDb();
    return await this.notesStore.get(id);
  }

  async getNotesByChapterId(chapterId) {
    await this.getDb();
    return await this.notesStore.getAllByIndex('byChapterId', chapterId);
  }

  async updateNote(id, updates) {
    await this.getDb();
    return await this.notesStore.update(id, updates);
  }

  async deleteNote(id) {
    await this.getDb();
    return await this.notesStore.delete(id);
  }

  async getAllNotes() {
    await this.getDb();
    return await this.notesStore.getAll();
  }

  async getNotesCount() {
    await this.getDb();
    return await this.notesStore.count();
  }

  async getChaptersCount() {
    await this.getDb();
    return await this.chaptersStore.count();
  }

  async clearDatabase() {
    const db = await this.dbPromise;
    db.close();
    
    return new Promise((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase("HelpViewer");
      deleteReq.onsuccess = () => {
        this.dbPromise = null;
        this.helpFileIdx = null;
        this.stores.clear();
        resolve(true);
      };
      deleteReq.onerror = () => reject(deleteReq.error);
    });
  }
}

const helpDB = new HelpViewerDB();

