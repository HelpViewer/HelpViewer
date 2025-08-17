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
  }

  init() {
    const T = this.constructor;
    const TI = this;
    const h_EVT_GETS_GET = (data) => {
      const url = new URL(window.location.href);
      const urlParams = new URLSearchParams(url.search);
        // if (!this.params) 
      //   this.h_EVT_GETS_LOAD(data);

      // var val = this.params[data.name];
      var val = urlParams.get(data.name);

      if (data.conversionHandler && typeof data.conversionHandler === 'function')
        val = data.conversionHandler(val);

      data.result = val;
    };
    TI.eventDefinitions.push([T.EVT_GETS_GET, GetsGet, h_EVT_GETS_GET]);

    const h_EVT_GETS_SET = (data) => {
      if (!data || data.kvlist.size == 0)
        return;

      const changes = new GetsChanges();

      data.unset.forEach((x) => delete this.params[x]);

      var hash = undefined;
      if (data.kvlist.has(GETS_KEY_HASH)) {
        hash = this.params[GETS_KEY_HASH];
        data.kvlist.delete(GETS_KEY_HASH);
      }

      var pathname = undefined;
      if (data.kvlist.has(GETS_KEY_PATH)) {
        pathname = this.params[GETS_KEY_PATH];
        data.kvlist.delete(GETS_KEY_PATH);
      }

      for (const [key, value] of data.kvlist)
      {
        if (this.params[key] != value)
          changes.changes.set(key, value);
        this.params[key] = value;
      }

      const filteredParams = Object.entries(this.params).filter(([key, _]) => !key.startsWith('_'));
      const newUrlParams = new URLSearchParams(filteredParams);
      const url = new URL(window.location.href);
      url.search = newUrlParams.toString();

      if (hash)
        url.hash = hash;

      if (pathname)
        url.pathname = pathname;
      
      this.h_EVT_GETS_LOAD(null);

      history.pushState(null, "", url.toString());
      this.onUriChanged(data.eventId);
    };
    TI.eventDefinitions.push([T.EVT_GETS_SET, GetsSet, h_EVT_GETS_SET]);

    const h_EVT_GETS_SET_HREF = (data) => {
      if (data.href == undefined)
        return;
      
      this.h_EVT_GETS_LOAD(null);
      history.pushState({}, '', data.href);
      this.onUriChanged(data.eventId);
    };

    TI.eventDefinitions.push([T.EVT_GETS_SET_HREF, GetsSet, h_EVT_GETS_SET_HREF]);

    TI.eventDefinitions.push([T.EVT_GETS_CHANGES, GetsChanges, null]); // outside event handlers

    window.addEventListener('popstate', this.onUriChanged);
    window.addEventListener('hashchange', this.onUriChanged);

    super.init();
  }

  onET_PluginsLoadingFinished(evt) {
    this.onUriChanged();
  }
  
  deInit() {
    super.deInit();

    window.removeEventListener('popstate', this.onUriChanged);
    window.removeEventListener('hashchange', this.onUriChanged);
  }

  h_EVT_GETS_LOAD(data) {
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    if (hash)
      urlParams.set(GETS_KEY_HASH, hash);

    if (pathname)
      urlParams.set(GETS_KEY_PATH, pathname);
    
    this.params = Object.fromEntries(urlParams.entries());
  };

  onUriChanged(parentEventId) {
    if (this.params) {
      const T = this.constructor;
      const parOld = getObjectCopy(this.params);
      this.h_EVT_GETS_LOAD(null);
      const summary = getDifferenceTwoObjects(parOld, this.params);
  
      sendEvent(T.EVT_GETS_CHANGES, (changes) => {
        if (parentEventId === 'string')
          changes.parentEventId = parentEventId;
  
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
