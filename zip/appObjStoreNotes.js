class HelpViewerDB {
  constructor() {
    this.dbPromise = undefined;
    this.helpFileIdx = undefined;

    this.storeConfig = {
      helpFile: { 
        indexes: [{ name: 'byName', key: 'name', unique: true }] 
      },
      chapter: { 
        indexes: [{ name: 'byName', key: 'name', unique: true }] 
      },
      note: { 
        indexes: [{ name: 'byChapterId', key: 'chapterId', unique: false }] 
      }
    };
  }

  async getDb() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open('HelpViewer', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

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

            const suffixName = storeName.charAt(0).toUpperCase() + storeName.slice(1);
            this[`add${suffixName}`] = (data) => this.add(storeName, data);
            this[`get${suffixName}`] = (id) => this.get(storeName, id);
            this[`update${suffixName}`] = (id, updates) => this.update(storeName, id, updates);
            this[`delete${suffixName}`] = (id) => this.delete(storeName, id);
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
      throw new Error(`DB operace selhala: ${error.message}`);
    }
  }

  async _transaction(storeName, mode, callback) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      callback(store, resolve, reject);
    });
  }

  async add(storeName, record) {
    return this._execute(() => 
      this._transaction(storeName, 'readwrite', (store, resolve, reject) => {
        const request = store.add(record);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
  }

  async get(storeName, id) {
    return this._execute(() => 
      this._transaction(storeName, 'readonly', (store, resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
  }

  async getAll(storeName) {
    return this._execute(() => 
      this._transaction(storeName, 'readonly', (store, resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
  }

  async update(storeName, id, updates) {
    return this._execute(() => 
      this._transaction(storeName, 'readwrite', (store, resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            const updated = { ...getRequest.result, ...updates };
            const putRequest = store.put(updated);
            putRequest.onsuccess = () => resolve(updated);
            putRequest.onerror = () => reject(putRequest.error);
          } else reject(new Error(`Záznam s ID ${id} nenalezen`));
        };
        getRequest.onerror = () => reject(getRequest.error);
      })
    );
  }

  async delete(storeName, id) {
    return this._execute(() => 
      this._transaction(storeName, 'readwrite', (store, resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      })
    );
  }

  async count(storeName) {
    return this._execute(() => 
      this._transaction(storeName, 'readonly', (store, resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
  }

  async getByIndex(storeName, indexName, value) {
    return this._execute(() => 
      this._transaction(storeName, 'readonly', (store, resolve, reject) => {
        const index = store.index(indexName);
        const request = index.get(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
  }

  async getAllByIndex(storeName, indexName, value) {
    return this._execute(() => 
      this._transaction(storeName, 'readonly', (store, resolve, reject) => {
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );
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
