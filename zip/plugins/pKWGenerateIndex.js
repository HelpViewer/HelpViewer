class pKWGenerateIndex extends IPlugin {
  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;

    this.DEFAULT_KEY_CFG_MINWORDLENGTH = 3;
    this.DEFAULT_KEY_CFG_ADDITIONALINDEXFILES = '_sidebar.md;_navbar.md';
  }

  init() {
    const T = this.constructor;
    const TI = this;
    
    TI.catalogizeEventCall(TI.onETIndexFileNotExists, EventNames.IndexFileSetData);

    super.init();
    this.asyncStack = undefined;
  }
  
  onET_UserDataFileLoaded(r) {
    this.asyncStack = undefined;
  }

  onETIndexFileNotExists(r) {
    if (this.asyncStack) 
      return;

    this.asyncStack = Promise.resolve();
    this.fileListM = undefined;
    this.chapterLinks = [];

    getHelpListingFiles((fileListM, readme) => {
      this.cfgADDITIONALINDEXFILES.split(';').forEach(f => {
        if (!fileListM.has(f))
          fileListM.set(f, f);
      });
      this.fileListM = fileListM;
      this._processFileList(fileListM, true);
    });
  }

  onETChapterShown(r) {
    r.result = (r.result || Promise.resolve()).then((x) => this._sumUpIndex(r));
  }

  _sumUpIndex(r) {
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

    const $pKWGenerateIndex$oneDocumentRead = (file) => Promise.resolve(showChapter(undefined, undefined, file, undefined, undefined, this.aliasName));

    this.asyncStack = this.asyncStack.then(() => {
      const filesIndexed = flArray.map(([file, title]) => $pKWGenerateIndex$oneDocumentRead(file));
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
        flatArray = flatArray.filter((x) => x && x[0] && x[0].length >= this.cfgMINWORDLENGTH);

        const grouped = Object.create(null);
        const flArrayFiles = flArray.map((x) => x[0]);

        for (const [file, innerMap] of this.indexes) {
          for (var [key, value] of innerMap) {
            if (!key || key.length < this.cfgMINWORDLENGTH) 
              continue;

            if (key === 'constructor')
              key = 'constructo';
            
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
