const GETS_KEY_HASH = '_hash';
const GETS_KEY_PATH = '_path';

class GetsGet extends IEvent {
  constructor() {
    super();
    this.name = '';
    this.conversionHandler = undefined;
  }
}

class GetsSet extends IEvent {
  constructor() {
    super();
    this.kvlist = new Map();
    this.unset = [];
  }
}

class GetsSetHref extends IEvent {
  constructor() {
    super();
    this.href = undefined;
  }
}

class GetsChanges extends IEvent {
  constructor() {
    super();
    this.changes = new Map();
    this.unset = [];
  }
}

class pGets extends IPlugin {
  static EVT_GETS_GET = GetsGet.name;
  static EVT_GETS_SET = GetsSet.name;
  static EVT_GETS_SET_HREF = GetsSetHref.name;
  static EVT_GETS_CHANGES = GetsChanges.name;

  constructor(aliasName, data) {
    super(aliasName, data);
    this.params = {};
    this.location = '';
    this.hash = '';
  }

  static eventDefinitions = [];
  
  init() {
    var h_EVT_GETS_GET = (data) => {
      if (!this.params) 
        this.h_EVT_GETS_LOAD(data);

      var val = this.params[data.name];

      if (data.conversionHandler && typeof data.conversionHandler === 'function')
        val = data.conversionHandler(val);

      return val;
    };
    pGets.eventDefinitions.push([pGets.EVT_GETS_GET, GetsGet, h_EVT_GETS_GET]);

    var h_EVT_GETS_SET = (data) => {
      if (!data || data.kvlist.size == 0)
        return;

      const changes = new GetsChanges();

      data.unset.forEach((x) => delete this.params[x]);

      if (data.kvlist.has(GETS_KEY_HASH)) {
        this.hash = this.params[GETS_KEY_HASH];
        data.kvlist.delete(GETS_KEY_HASH);
      }

      if (data.kvlist.has(GETS_KEY_PATH)) {
        this.pathname = this.params[GETS_KEY_PATH];
        data.kvlist.delete(GETS_KEY_PATH);
      }

      for (const [key, value] of data.kvlist)
      {
        if (this.params[key] != value)
          changes.changes.set(key, value);
        this.params[key] = value;
      }

      const newUrlParams = new URLSearchParams(this.params);
      const url = new URL(window.location.href);
      url.search = newUrlParams.toString();
      url.hash = this.hash;
      url.pathname = this.pathname;
      
      history.pushState(null, "", url.toString());
      this.onUriChanged();
    };
    pGets.eventDefinitions.push([pGets.EVT_GETS_SET, GetsSet, h_EVT_GETS_SET]);

    var h_EVT_GETS_SET_HREF = (data) => {
      if (data.href == undefined)
        return;
      
      history.pushState({}, '', data.href);
      this.onUriChanged();
    };

    pGets.eventDefinitions.push([pGets.EVT_GETS_SET_HREF, GetsSet, h_EVT_GETS_SET_HREF]);
    
    pGets.eventDefinitions.push([pGets.EVT_GETS_CHANGES, GetsChanges, null]); // outside event handlers

    window.addEventListener('popstate', this.onUriChanged);
    window.addEventListener('hashchange', this.onUriChanged);

    super.init();
    //this.h_EVT_GETS_LOAD();
    this.onUriChanged();
  }
  
  deInit() {
    super.deInit();
    removeEventDefinition(pGets.EVT_GETS_GET);
    removeEventDefinition(pGets.EVT_GETS_SET);
    removeEventDefinition(pGets.EVT_GETS_SET_HREF);
    removeEventDefinition(pGets.EVT_GETS_CHANGES);

    window.removeEventListener('popstate', this.onUriChanged);
    window.removeEventListener('hashchange', this.onUriChanged);
  }

  h_EVT_GETS_LOAD(data) {
    this.location = window.location.href;
    const url = new URL(this.location);
    this.hash = window.location.hash;
    this.pathname = window.location.pathname;
    const urlParams = new URLSearchParams(url.search);
    urlParams[GETS_KEY_HASH] = this.hash;
    urlParams[GETS_KEY_PATH] = this.pathname;
    this.params = Object.fromEntries(urlParams.entries());
    const keys = Object.keys(this.params);
  };

  onUriChanged() {
    const parOld = getObjectCopy(this.params);
    this.h_EVT_GETS_LOAD(null);
    const summary = getDifferenceTwoObjects(parOld, this.params);

    sendEvent(pGets.EVT_GETS_CHANGES, (changes) => {
      for (const key in summary) {
        if (summary[key].new == undefined) {
          changes.unset.push(key);
          continue;
        }
  
        changes.changes.set(key, summary[key].new);
      }  
    });
  }
}
  
function getDifferenceTwoObjects(obj1i, obj2i) {
  const obj1 = obj1i || {};
  const obj2 = obj2i || {};
  const diffs = {};
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  keys.forEach((key) => {
    if (obj1[key] != obj2[key]) {
      diffs[key] = { old: obj1[key], new: obj2[key] };
    }
  });

  return diffs;
}

function getObjectCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

Plugins.catalogize(pGets);
