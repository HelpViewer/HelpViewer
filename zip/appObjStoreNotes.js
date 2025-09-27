class IndexedDBOperator {
  constructor() {
    this.dbPromise = undefined;
    this.storeConfig = {};
  }

  async getDb() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open('HelpViewer', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          Object.entries(this.storeConfig).forEach(([storeName, config]) => {
            const suffixName = storeName.charAt(0).toUpperCase() + storeName.slice(1);
            this[`add${suffixName}`] = (data) => this.add(storeName, data);
            this[`get${suffixName}`] = (id) => this.get(storeName, id);
            this[`update${suffixName}`] = (id, updates) => this.update(storeName, id, updates);
            this[`delete${suffixName}`] = (id) => this.delete(storeName, id);
          });
          return resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          Object.entries(this.storeConfig).forEach(([storeName, config]) => {
            if (!db.objectStoreNames.contains(storeName)) {
              const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
              
              // Vytvoření indexů podle konfigurace
              config.indexes?.forEach(({ name, key, unique }) => {
                store.createIndex(name, key, { unique });
              });
            }

          });
        };
      });

    }

    return this.dbPromise;
  }

  async _execute(operation) {
    try {
      return await operation();
    } catch (error) {
      throw new Error(`DB operation failed: ${error.message}`);
    }
  }

  _request(store, method, ...args) {
    return new Promise((resolve, reject) => {
      const request = store[method](...args);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Transakce pro jeden nebo více stores
  async _transaction(storeNames, mode, callback) {
    const db = await this.getDb();
    const tx = db.transaction(storeNames, mode);
    const stores = Array.isArray(storeNames) 
      ? Object.fromEntries(storeNames.map(name => [name, tx.objectStore(name)])) 
      : { [storeNames]: tx.objectStore(storeNames) };

    const result = await callback(stores);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
    });
  }

  async add(storeName, record) {
    return this._transaction(storeName, 'readwrite', store =>
      this._request(store[storeName], 'add', record)
    );
  }

  async get(storeName, id) {
    return this._transaction(storeName, 'readonly', store =>
      this._request(store[storeName], 'get', id)
    );
  }

  async getAll(storeName) {
    return this._transaction(storeName, 'readonly', store =>
      this._request(store[storeName], 'getAll')
    );
  }

  async update(storeName, id, updates) {
    return this._transaction(storeName, 'readwrite', async store => {
      const existing = await this._request(store[storeName], 'get', id);
      if (!existing) throw new Error(`Record ${id} not found`);
      const updated = { ...existing, ...updates };
      await this._request(store[storeName], 'put', updated);
      return updated;
    });
  }

  async delete(storeName, id) {
    return this._transaction(storeName, 'readwrite', store =>
      this._request(store[storeName], 'delete', id)
    );
  }

  async count(storeName) {
    const db = await this.getDb();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return this._request(store.count());
  }

  async getByIndex(storeName, indexName, value) {
    return this._transaction(storeName, 'readonly', store => 
      this._request(store[storeName].index(indexName), 'get', value)
    );
  }

  async getAllByIndex(storeName, indexName, value) {
    return this._transaction(storeName, 'readonly', store => 
      this._request(store[storeName].index(indexName), 'getAll', value)
    );
  }

  async addMany(storeName, records) {
    return this._execute(() => 
      this._transaction(storeName, 'readwrite', (store, resolve, reject) => {
        const results = [];
        let completed = 0;
        
        if (records.length === 0) {
          resolve([]);
          return;
        }

        records.forEach((record, index) => {
          const request = store.add(record);
          request.onsuccess = () => {
            results[index] = request.result;
            completed++;
            if (completed === records.length) resolve(results);
          };
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  async deleteMany(storeName, ids) {
    return this._execute(() => 
      this._transaction(storeName, 'readwrite', (store, resolve, reject) => {
        let completed = 0;
        
        if (ids.length === 0) {
          resolve(true);
          return;
        }

        ids.forEach(id => {
          const request = store.delete(id);
          request.onsuccess = () => {
            completed++;
            if (completed === ids.length) resolve(true);
          };
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  async exists(storeName, id) {
    const result = await this.get(storeName, id);
    return !!result;
  }

  async existsByIndex(storeName, indexName, value) {
    const result = await this.getByIndex(storeName, indexName, value);
    return !!result;
  }

  async getDbStats() {
    const stats = {};
    for (const storeName of Object.keys(this.storeConfig)) {
      stats[storeName] = await this.count(storeName);
    }
    return stats;
  }

  async clearStore(storeName) {
    return this._execute(() => 
      this._transaction(storeName, 'readwrite', (store, resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      })
    );
  }

  async clearAllData() {
    const promises = Object.keys(this.storeConfig).map(store => this.clearStore(store));
    return Promise.all(promises);
  }
}

class HelpViewerDB extends IndexedDBOperator {
  constructor() {
    super();

    this.storeConfig = {
      helpFile: { 
        indexes: [{ name: 'byName', key: 'name', unique: true }] 
      },
      chapter: { 
        indexes: [{ name: 'byName', key: 'name', unique: true }] 
      },
      note: { 
        indexes: [
          { name: 'byChapterId', key: 'chapterId', unique: false },
          { name: 'byHelpId', key: 'helpId', unique: false }
        ]
      }
    };
  }

  async getHelpIdByName(name) {
    const result = await this.getByIndex('helpFile', 'byName', name);
    return result?.id || null;
  }

  async getChapterIdByName(name) {
    const result = await this.getByIndex('chapter', 'byName', name);
    return result?.id || null;
  }

  async getNotesByChapter(chapterId) {
    return this.getAllByIndex('note', 'byChapterId', chapterId);
  }
}
