class HelpViewerDB extends IndexedDBOperator {
  constructor(durability = "relaxed") {
    super(durability);

    this.storeConfig = {
      helpFile: { 
        indexes: [{ name: 'byName', key: 'name', unique: true }] 
      },
      chapter: { 
        indexes: [
          { name: 'byNameHelpId', key: ['name', 'helpId'], unique: true },
          { name: 'byHelpId', key: 'helpId', unique: false },
        ]
      },
      note: { 
        indexes: [
          { name: 'byChapterId', key: 'chapterId', unique: false }
        ]
      }
    };
  }

  async getHelpIdByName(name) {
    const result = await this.getByIndex('helpFile', 'byName', name);
    return result?.id || null;
  }

  async getChapterIdByName(name, helpId) {
    const result = await this.getByIndex('chapter', 'byNameHelpId', [name, helpId]);
    return result?.id || null;
  }

  async getNotesByChapter(chapterId) {
    return this.getAllByIndex('note', 'byChapterId', chapterId);
  }

  async getChaptersByHelpFile(helpFileIdx) {
    return this.getAllByIndex('chapter', 'byHelpId', helpFileIdx);
  }
}
