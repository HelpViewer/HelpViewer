class pKWGenerateIndex extends IPlugin {
  static KEY_CFG_FILENAMEKW = 'FILENAMEKW';
  static KEY_CFG_FILENAMEKWMAP = 'FILENAMEKWMAP';
  static KEY_CFG_FILENAMELISTFILES = 'FILENAMELISTFILES';
  static KEY_CFG_MINWORDLENGTH = 'MINWORDLENGTH';

  constructor(aliasName, data) {
    super(aliasName, data);
    this.eventIdStrict = true;

    this.DEFAULT_KEY_CFG_FILENAMEKW = 'fts-keywords.lst';
    this.DEFAULT_KEY_CFG_FILENAMEKWMAP = 'fts-keywords-files.lst';
    this.DEFAULT_KEY_CFG_FILENAMELISTFILES = 'files.lst';
    this.DEFAULT_KEY_CFG_MINWORDLENGTH = 3;
  }

  init() {
    const T = this.constructor;
    const TI = this;
    
    this.cfgFilenameKW = this.config[T.KEY_CFG_FILENAMEKW] || TI.DEFAULT_KEY_CFG_FILENAMEKW;
    this.cfgFilenameKWMAP = this.config[T.KEY_CFG_FILENAMEKWMAP] || TI.DEFAULT_KEY_CFG_FILENAMEKWMAP;
    this.cfgFilenameFiles = this.config[T.KEY_CFG_FILENAMELISTFILES] || TI.DEFAULT_KEY_CFG_FILENAMELISTFILES;
    this.cfgMinWordLength = parseInt(this.config[T.KEY_CFG_MINWORDLENGTH]) || TI.DEFAULT_KEY_CFG_MINWORDLENGTH;

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
    this.asyncStack = this.asyncStack.then(() => storageSearch(STO_HELP, this.cfgFilenameFiles));
    this.flArray = [];

    this.asyncStack = this.asyncStack.then((fileList) => {
      if (fileList) {
        const flArray = rowsToArray(fileList.trim())
          .filter((x) => !(/^(http|=)/.test(x)))
          .map(r => r = r.split('|'));

        this.flArray = flArray;
        log('E x a', flArray);

        if (Object.keys(flArray).length == 0) 
          return Promise.resolve();

        const filesIndexed = flArray.map(([file, title]) => Promise.resolve(showChapter(undefined, undefined, file, undefined, undefined, this.aliasName)));
        return Promise.all(filesIndexed).then((fileIndexes) => {
          return fileIndexes;
        });

      }
    });

    this.indexes = new Map();
    this.countProcessed = 0;
    this.countRequired = 0;
    this.lastCount = 0;
    this.asyncStack = this.asyncStack.then((fileIndexes) => this.countRequired = fileIndexes.length);

    this.asyncStack = this.asyncStack.then((x) => {
      var intervalId = null;

      const watchdog = new Promise((resolve, reject) => {
        intervalId = setInterval(() => {
          if (this.countProcessed === this.countRequired) {
            clearInterval(intervalId);
            resolve(true);
          } else if (this.countProcessed === this.lastCount) {
            resolve(false);
          } else {
            this.lastCount = this.countProcessed;
          }
        }, 3000);
      }).then((result) => {
        // indexes per file
        log('E rtz uzavírá se', this.indexes);
        var flatArray = [];

        for (const [file, innerMap] of this.indexes) {
          for (const [key, value] of innerMap) {
            flatArray.push([key, value, file]);
          }
        }

        // all index records in flat, min word length filtered out
        log('E rtz uzavírá se flat array pre', flatArray);
        flatArray = flatArray.filter((x) => x && x[0] && x[0].length >= this.cfgMinWordLength);
        log('E rtz uzavírá se flat array post', flatArray);

        const grouped = {};

        // grouping per word
        flatArray.forEach(([key, value, file]) => {
          if (!grouped[key]) 
            grouped[key] = [];

          grouped[key].push([value, file]);
          log('E RRRRRRRRRR', grouped[key]);
        });

        const keywords = Object.keys(grouped).sort();
        log('E kwds', grouped);
        alert('::1');

        keywords.forEach(x => {
          log('E grouped dump', x, grouped[x]);
        });
        alert('::2');

        keywords.forEach((x) => grouped[x].sort((a, b) => b[0] - a[0]));
        log('E rtz uzavírá se (2)', grouped);
        alert('::3');

        this.flArrayFiles = this.flArray.map((x) => x[0]);

        keywords.forEach((key) => grouped[key] = grouped[key].map(([count, filename]) => this.flArrayFiles.indexOf(filename)));

        log('E rtz uzavírá se (3)', grouped);
      });
    });
    
  }

  onETChapterShown(r) {
    log('E CSWN:', r);
    this.indexes.set(r.address, new Map(r.content));
    this.countProcessed++;
  }
}

Plugins.catalogize(pKWGenerateIndex);
