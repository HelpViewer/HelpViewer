class pKWGenerateIndex extends IPlugin {
  static KEY_CFG_FILENAMEKW = 'FILENAMEKW';
  static KEY_CFG_FILENAMEKWMAP = 'FILENAMEKWMAP';
  static KEY_CFG_FILENAMELISTFILES = 'FILENAMELISTFILES';
  static KEY_CFG_MINWORDLENGTH = 'MINWORDLENGTH';
  static KEY_CFG_ADDITIONALINDEXFILES = 'ADDITIONALINDEXFILES';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;

    this.DEFAULT_KEY_CFG_FILENAMEKW = 'fts-keywords.lst';
    this.DEFAULT_KEY_CFG_FILENAMEKWMAP = 'fts-keywords-files.lst';
    this.DEFAULT_KEY_CFG_FILENAMELISTFILES = 'files.lst';
    this.DEFAULT_KEY_CFG_MINWORDLENGTH = 3;
    this.DEFAULT_KEY_CFG_ADDITIONALINDEXFILES = '_sidebar.md;_navbar.md';
  }

  init() {
    const T = this.constructor;
    const TI = this;
    
    this.cfgFilenameKW = this.config[T.KEY_CFG_FILENAMEKW] || TI.DEFAULT_KEY_CFG_FILENAMEKW;
    this.cfgFilenameKWMAP = this.config[T.KEY_CFG_FILENAMEKWMAP] || TI.DEFAULT_KEY_CFG_FILENAMEKWMAP;
    this.cfgFilenameFiles = this.config[T.KEY_CFG_FILENAMELISTFILES] || TI.DEFAULT_KEY_CFG_FILENAMELISTFILES;
    this.cfgMinWordLength = parseInt(this.config[T.KEY_CFG_MINWORDLENGTH]) || TI.DEFAULT_KEY_CFG_MINWORDLENGTH;
    this.cfgAdditionalIndexFiles = this.config[T.KEY_CFG_ADDITIONALINDEXFILES] || TI.DEFAULT_KEY_CFG_ADDITIONALINDEXFILES;

    super.init();
    this.asyncStack = undefined;
  }

  deInit() {
    super.deInit();
  }

  onETIndexFileNotExists(r) {
    if (this.asyncStack) 
      return;

    this.asyncStack = Promise.resolve();
    this.fileListM = undefined;
    this.chapterLinks = [];

    getHelpListingFiles((fileListM, readme) => {
      this.cfgAdditionalIndexFiles.split(';').forEach(f => {
        if (!fileListM.has(f))
          fileListM.set(f, f);
      });
      this.fileListM = fileListM;
      this._processFileList(fileListM, true);
    });
  }

  onETChapterShown(r) {
    this.indexes.set(r.address, new Map(r.content[0]));
    this.countProcessed++;
    this.chapterLinks.push(...r.content[1])
  }

  _processFileList(fileListM, firstRun = false) {
    if (!fileListM || fileListM.size == 0)
      return;

    const flArray = [...fileListM];
    setChapterIndex(flArray.map((x) => `${x[0]}|${x[1]}`).join('\n'));
    this.countRequired = 0;

    this.asyncStack = this.asyncStack.then(() => {
      const filesIndexed = flArray.map(([file, title]) => Promise.resolve(showChapter(undefined, undefined, file, undefined, undefined, this.aliasName)));
      return Promise.all(filesIndexed).then((fileIndexes) => {
        this.countRequired = fileIndexes.length;
        return fileIndexes;
      });
    });

    this.indexes = new Map();
    this.countProcessed = 0;
    this.lastCount = 0;

    this.asyncStack = this.asyncStack.then((x) => {
      var intervalId = null;

      const watchdog = new Promise((resolve, reject) => {
        intervalId = setInterval(() => {
          if (this.countProcessed === this.countRequired) {
            clearInterval(intervalId);
            resolve(true);
          } else if (this.countProcessed === this.lastCount) {
            clearInterval(intervalId);
            resolve(false);
          } else {
            this.lastCount = this.countProcessed;
          }
        }, 1000);
      })
      .then((x) => {
        const firstSize = fileListM.size;
        const cl = this.chapterLinks;
        this.chapterLinks = [];
        cl.forEach((x) => {
          if (!this.fileListM.has(x))
            this.fileListM.set(x[0], x[1]);
        });
        
        if (firstSize != fileListM.size) {
          this._processFileList(fileListM);
          return false;
        }
      })
      .then((result) => {
        if (result === false)
          return;
        // indexes per file
        var flatArray = [];

        for (const [file, innerMap] of this.indexes) {
          for (const [key, value] of innerMap) {
            flatArray.push([key, value, file]);
          }
        }

        // all index records in flat, min word length filtered out
        flatArray = flatArray.filter((x) => x && x[0] && x[0].length >= this.cfgMinWordLength);

        const grouped = {};
        const flArrayFiles = flArray.map((x) => x[0]);

        for (const [file, innerMap] of this.indexes) {
          for (const [key, value] of innerMap) {
            if (!key || key.length < this.cfgMinWordLength) 
              continue;
            
            // grouping per word
            if (!grouped[key])
              grouped[key] = [];
            
            // file path to file list index
            grouped[key].push([value, flArrayFiles.indexOf(file)]);
          }
        }

        const keywords = Object.keys(grouped).sort();

        // keywords to files mapping
        const keywordsToFiles = keywords.map(key => {
          // sorting by count of word in chapter (descending)
          grouped[key].sort((a, b) => b[0] - a[0]);

          // file ids to list string
          return grouped[key].map(([count, fileIndex]) => fileIndex).join(';');
        });

        log(`Statistics: words: ${keywords.length}, mapped files: ${flArrayFiles.length}.`);

        if (keywords.length > 0 && keywordsToFiles.length > 0)
          setIndexFileData(this.aliasName, keywords.join('\n'), keywordsToFiles.join('\n'));
      });
    });

  }

}

Plugins.catalogize(pKWGenerateIndex);
