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
